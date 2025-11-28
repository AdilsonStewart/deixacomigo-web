import React, { useState } from "react";

const Servicos = () => {
  const [loading, setLoading] = useState(false);
  const [metodoSelecionado, setMetodoSelecionado] = useState(null);

  const pagar = async (valor, tipo, metodo) => {
    setLoading(true);
    setMetodoSelecionado(metodo);

    try {
      const res = await fetch("/.netlify/functions/criar-pagamento-asaas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          valor,
          tipo,
          metodo,
          pedidoId: "pedido_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9)
        })
      });

      const data = await res.json();

      if (data.success) {
        if (metodo === "PIX") {
          localStorage.setItem("pedidoId", data.pedidoId);
          localStorage.setItem("tipoServico", tipo);
          window.location.href = `/aguardando-pix?pedido=${data.pedido}&qrcode=${encodeURIComponent(data.qrCodeBase64)}`;
        } else {
          // Cartão
          window.location.href = data.checkoutUrl;
        }
      } else {
        alert("Erro do Asaas: " + (data.error || "Tente novamente"));
      }
    } catch (e) {
      console.error(e);
      alert("Erro: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "500px", margin: "50px auto", textAlign: "center" }}>
      <img
        src="https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExc2ptcWV6bGhpdTF4cWJhd25yanZvNGVpb25vcGhiaGY1d2Qya3NraiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/MYzuiycbNu0J9lKrcz/giphy.gif"
        alt="coruja fofinha"
        style={{
          width: "180px",
          borderRadius: "50%",
          border: "3px solid #ff69b4",
          boxShadow: "0 4px 8px rgba(0,0,0,0.2)"
        }}
      />
      <h2 style={{ marginTop: '20px', color: '#333' }}>Escolha seu serviço</h2>

      {/* ÁUDIO */}
      <div style={cardStyle}>
        <h3 style={{ color: '#28a745', marginBottom: '15px' }}>ÁUDIO 30s — R$ 1,99</h3>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button onClick={() => pagar(1.99, "áudio", "PIX")} disabled={loading} style={btnPix}>
            {loading && metodoSelecionado === 'PIX' ? "Gerando PIX..." : "PIX"}
          </button>
          <button onClick={() => pagar(1.99, "áudio", "CREDIT_CARD")} disabled={loading} style={btnCartao}>
            {loading && metodoSelecionado === 'CREDIT_CARD' ? "Redirecionando..." : "Cartão"}
          </button>
        </div>
      </div>

      {/* VÍDEO */}
      <div style={cardStyle}>
        <h3 style={{ color: '#007bff', marginBottom: '15px' }}>VÍDEO 30s — R$ 8,00</h3>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button onClick={() => pagar(8.0, "vídeo", "PIX")} disabled={loading} style={btnPix}>
            {loading && metodoSelecionado === 'PIX' ? "Gerando PIX..." : "PIX"}
          </button>
          <button onClick={() => pagar(8.0, "vídeo", "CREDIT_CARD")} disabled={loading} style={btnCartao}>
            {loading && metodoSelecionado === 'CREDIT_CARD' ? "Redirecionando..." : "Cartão"}
          </button>
        </div>
      </div>

      <p style={{ marginTop: "40px", color: "#666", fontSize: "14px" }}>
        Pagou com PIX? Você será redirecionado automaticamente em até 15 segundos após a confirmação.
      </p>
    </div>
  );
};

const cardStyle = {
  backgroundColor: '#f8f9fa',
  padding: '20px',
  borderRadius: '10px',
  margin: '20px 0',
  border: '2px solid #e9ecef'
};

const btnPix = {
  backgroundColor: '#32CD32',
  color: 'white',
  padding: '14px',
  border: 'none',
  borderRadius: '10px',
  fontSize: '16px',
  fontWeight: 'bold',
  cursor: 'pointer',
  flex: 1
};

const btnCartao = {
  backgroundColor: '#0066CC',
  color: 'white',
  padding: '14px',
  border: 'none',
  borderRadius: '10px',
  fontSize: '16px',
  fontWeight: 'bold',
  cursor: 'pointer',
  flex: 1
};

export default Servicos;
