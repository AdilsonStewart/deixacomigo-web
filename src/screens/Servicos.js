import React, { useState } from "react";

const Servicos = () => {
  const [copiaECola, setCopiaECola] = useState("");
  const [loading, setLoading] = useState(false);

  const pagar = async (valor, tipo) => {
    setLoading(true);
    setCopiaECola("");

    try {
      const res = await fetch("/.netlify/functions/criar-pix-asaas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ valor, tipo })
      });

      const data = await res.json();
      
      if (data.success && data.copiaECola) {
        setCopiaECola(data.copiaECola);
        // COPIA AUTOMATICAMENTE para a área de transferência
        navigator.clipboard.writeText(data.copiaECola);
        
        // ✅ SALVA O ID DO PAGAMENTO PARA VERIFICAÇÃO FUTURA
        if (data.id) {
          localStorage.setItem('ultimoPagamento', data.id);
          localStorage.setItem('tipoServico', tipo);
        }
        
        alert("PIX copiado! Cole no seu app bancário.");
      } else {
        alert("Erro: " + data.erro);
      }
    } catch (e) {
      alert("Erro: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  // 🔄 FUNÇÃO PARA VERIFICAR PAGAMENTO
  const verificarPagamento = async () => {
    const paymentId = localStorage.getItem('ultimoPagamento');
    const tipoServico = localStorage.getItem('tipoServico');
    
    if (!paymentId) {
      alert("❌ Nenhum pagamento recente encontrado.\nGere um PIX primeiro!");
      return;
    }

    alert(`🔍 Verificando pagamento...\nID: ${paymentId}\nServiço: ${tipoServico}`);
    
    // SIMULA verificação (vamos implementar Firebase depois)
    const pagamentoConfirmado = confirm(
      "💰 SIMULAÇÃO:\nO pagamento foi confirmado?\n\n" +
      "Em produção, isso verificará automaticamente no Firebase.\n\n" +
      "Clique em OK para ir para a página de sucesso!"
    );
    
    if (pagamentoConfirmado) {
      if (tipoServico === 'áudio') {
        window.location.href = "/sucesso";
      } else if (tipoServico === 'vídeo') {
        window.location.href = "/sucesso2";
      }
    }
  };

  // GERA QR CODE
  const qrUrl = copiaECola
    ? `https://chart.googleapis.com/chart?chs=300x300&cht=qr&chl=${encodeURIComponent(copiaECola)}`
    : "";

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto", textAlign: "center" }}>
      <img src="/coruja-rosa.gif" alt="coruja" style={{ width: "180px" }} />
      <h2>Escolha seu serviço</h2>

      {/* BOTÃO ÁUDIO - VERDE */}
      <button 
        onClick={() => pagar(5.0, "áudio")} 
        disabled={loading}
        style={{
          backgroundColor: '#28a745',
          color: 'white',
          padding: '15px 30px',
          border: 'none',
          borderRadius: '10px',
          fontSize: '16px',
          fontWeight: 'bold',
          cursor: 'pointer',
          margin: '10px',
          width: '200px',
          boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
          transition: 'all 0.3s'
        }}
        onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
        onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
      >
        {loading ? "🎧 GERANDO PIX..." : "🎧 ÁUDIO — R$ 5,00"}
      </button>

      <br />

      {/* BOTÃO VÍDEO - AZUL */}
      <button 
        onClick={() => pagar(8.0, "vídeo")} 
        disabled={loading}
        style={{
          backgroundColor: '#007bff',
          color: 'white',
          padding: '15px 30px',
          border: 'none',
          borderRadius: '10px',
          fontSize: '16px',
          fontWeight: 'bold',
          cursor: 'pointer',
          margin: '10px',
          width: '200px',
          boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
          transition: 'all 0.3s'
        }}
        onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
        onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
      >
        {loading ? "🎥 GERANDO PIX..." : "🎥 VÍDEO — R$ 8,00"}
      </button>

      {/* MENSAGEM SOBRE DEMORA DO PIX */}
      <div style={{
        margin: '20px 0', 
        padding: '15px',
        backgroundColor: '#fff3cd',
        border: '1px solid #ffeaa7',
        borderRadius: '5px',
        color: '#856404'
      }}>
        <strong>⏱️ Atenção:</strong> Pagamentos em PIX podem demorar alguns minutos para serem confirmados, diferente de cartões que são instantâneos.
      </div>

      {/* BOTÃO VERIFICAR PAGAMENTO */}
      <button 
        onClick={verificarPagamento}
        style={{
          backgroundColor: '#6c757d',
          color: 'white',
          padding: '12px 24px',
          border: 'none',
          borderRadius: '8px',
          fontSize: '16px',
          cursor: 'pointer',
          marginTop: '10px',
          fontWeight: 'bold'
        }}
      >
        🔄 Verificar Se Já Paguei
      </button>

      {copiaECola && (
        <div style={{ marginTop: "30px" }}>
          <h3>✅ PIX GERADO!</h3>
          <p>Já copiamos o código para você!</p>
          <img src={qrUrl} alt="QR Code Pix" style={{ maxWidth: "280px", borderRadius: "10px" }} />
          <p style={{ marginTop: "15px" }}>Ou use este código:</p>
          <textarea
            readOnly
            value={copiaECola}
            onClick={(e) => {
              e.target.select();
              navigator.clipboard.writeText(copiaECola);
              alert("Copiado novamente!");
            }}
            style={{ 
              width: "100%", 
              height: "100px", 
              fontFamily: "monospace", 
              padding: "10px",
              fontSize: "12px"
            }}
          />
          <p style={{ fontSize: "12px", color: "green" }}>
            ✅ Código copiado automaticamente! Cole no seu banco.
          </p>
        </div>
      )}
    </div>
  );
};

export default Servicos;
