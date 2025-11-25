import React, { useState } from "react";

const Servicos = () => {
  const [loading, setLoading] = useState(false);
  const [metodoSelecionado, setMetodoSelecionado] = useState(null);

  const pagar = async (valor, tipo, metodo) => {
    setLoading(true);
    setMetodoSelecionado(metodo);

    try {
      const res = await fetch("/.netlify/functions/criar-pagamento", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ valor, tipo, metodo })
      });

      const data = await res.json();
      
      if (data.success && data.paymentLink) {
        window.open(data.paymentLink, "_blank");
        alert("Redirecionando para pagamento...");
        
        localStorage.setItem("ultimoPagamento", data.id);
        localStorage.setItem("tipoServico", tipo);
        localStorage.setItem("metodoPagamento", metodo);
      } else {
        alert("Erro: " + (data.error || "Desconhecido"));
      }
    } catch (e) {
      alert("Erro: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const verificarPagamento = () => {
    const paymentId = localStorage.getItem("ultimoPagamento");
    const tipoServico = localStorage.getItem("tipoServico");
    const metodo = localStorage.getItem("metodoPagamento");

    if (!paymentId) {
      alert("❌ Nenhum pagamento recente encontrado.");
      return;
    }

    const confirmado = window.confirm(
      `🔍 Verificando pagamento...\n\nID: ${paymentId}\nServiço: ${tipoServico}\nMétodo: ${metodo}\n\n` +
      "💰 SIMULAÇÃO: O pagamento foi confirmado?\n\nClique em OK para ir para a página de sucesso!"
    );

    if (confirmado) {
      if (tipoServico === "áudio") {
        window.location.href = "/sucesso";
      } else if (tipoServico === "vídeo") {
        window.location.href = "/sucesso2";
      }
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

      <h2 style={{ marginTop: "20px", color: "#333" }}>Escolha seu serviço</h2>

      {/* ÁUDIO */}
      <div
        style={{
          backgroundColor: "#f8f9fa",
          padding: "20px",
          borderRadius: "10px",
          margin: "20px 0",
          border: "2px solid #e9ecef"
        }}
      >
        <h3 style={{ color: "#28a745", marginBottom: "15px" }}>🎧 ÁUDIO — R$ 1,99</h3>

        <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
          <button
            onClick={() => pagar(1.99, "áudio", "pix")}
            disabled={loading}
            style={{
              backgroundColor: "#28a745",
              color: "white",
              padding: "12px 20px",
              border: "none",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: "bold",
              cursor: "pointer",
              flex: 1
            }}
          >
            {loading && metodoSelecionado === "pix" ? "🔄" : "💰"} PIX
          </button>

          <button
            onClick={() => pagar(1.99, "áudio", "cartao")}
            disabled={loading}
            style={{
              backgroundColor: "#007bff",
              color: "white",
              padding: "12px 20px",
              border: "none",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: "bold",
              cursor: "pointer",
              flex: 1
            }}
          >
            {loading && metodoSelecionado === "cartao" ? "🔄" : "💳"} Cartão
          </button>
        </div>
      </div>

      {/* VÍDEO */}
      <div
        style={{
          backgroundColor: "#f8f9fa",
          padding: "20px",
          borderRadius: "10px",
          margin: "20px 0",
          border: "2px solid #e9ecef"
        }}
      >
        <h3 style={{ color: "#007bff", marginBottom: "15px" }}>🎥 VÍDEO — R$ 8,00</h3>

        <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
          <button
            onClick={() => pagar(8.0, "vídeo", "pix")}
            disabled={loading}
            style={{
              backgroundColor: "#28a745",
              color: "white",
              padding: "12px 20px",
              border: "none",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: "bold",
              cursor: "pointer",
              flex: 1
            }}
          >
            {loading && metodoSelecionado === "pix" ? "🔄" : "💰"} PIX
          </button>

          <button
            onClick={() => pagar(8.0, "vídeo", "cartao")}
            disabled={loading}
            style={{
              backgroundColor: "#007bff",
              color: "white",
              padding: "12px 20px",
              border: "none",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: "bold",
              cursor: "pointer",
              flex: 1
            }}
          >
            {loading && metodoSelecionado === "cartao" ? "🔄" : "💳"} Cartão
          </button>
        </div>
      </div>

      {/* BOTÃO VERIFICAR */}
      <div style={{ margin: "20px 0", padding: "15px" }}>
        <button
          onClick={verificarPagamento}
          style={{
            backgroundColor: "#6f42c1",
            color: "white",
            padding: "12px 25px",
            border: "none",
            borderRadius: "8px",
            fontSize: "15px",
            cursor: "pointer",
            width: "100%",
            fontWeight: "bold"
          }}
        >
          🔍 Verificar Pagamento
        </button>
      </div>
    </div>
  );
};

export default Servicos;
