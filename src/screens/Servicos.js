import React, { useState } from "react";

const Servicos = () => {
  const [copiaECola, setCopiaECola] = useState("");
  const [loading, setLoading] = useState(false);
  const [metodoSelecionado, setMetodoSelecionado] = useState(null); // 'pix' ou 'cartao'

  const pagar = async (valor, tipo, metodo) => {
    setLoading(true);
    setCopiaECola("");
    setMetodoSelecionado(metodo);

    try {
      const res = await fetch("/.netlify/functions/criar-pagamento-asaas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ valor, tipo, metodo })
      });

      const data = await res.json();
      
      if (data.success) {
        if (metodo === 'pix' && data.copiaECola) {
          setCopiaECola(data.copiaECola);
          navigator.clipboard.writeText(data.copiaECola);
          alert("PIX copiado! Cole no seu app bancário.");
        } else if (metodo === 'cartao' && data.checkoutUrl) {
          // Redireciona para checkout do cartão
          window.open(data.checkoutUrl, '_blank');
          alert("Redirecionando para pagamento com cartão!");
        }
        
        // Salva para verificação futura
        if (data.id) {
          localStorage.setItem('ultimoPagamento', data.id);
          localStorage.setItem('tipoServico', tipo);
          localStorage.setItem('metodoPagamento', metodo);
        }
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
    const metodo = localStorage.getItem('metodoPagamento');
    
    if (!paymentId) {
      alert("❌ Nenhum pagamento recente encontrado.");
      return;
    }

    const pagamentoConfirmado = window.confirm(
      `🔍 Verificando pagamento...\n\nID: ${paymentId}\nServiço: ${tipoServico}\nMétodo: ${metodo}\n\n` +
      "💰 SIMULAÇÃO: O pagamento foi confirmado?\n\n" +
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
    <div style={{ maxWidth: "500px", margin: "50px auto", textAlign: "center" }}>
      <img src="/coruja-rosa.gif" alt="coruja" style={{ width: "180px" }} />
      <h2>Escolha seu serviço</h2>

      {/* SERVIÇO ÁUDIO */}
      <div style={{
        backgroundColor: '#f8f9fa',
        padding: '20px',
        borderRadius: '10px',
        margin: '20px 0',
        border: '2px solid #e9ecef'
      }}>
        <h3 style={{ color: '#28a745', marginBottom: '15px' }}>🎧 ÁUDIO — R$ 5,00</h3>
        
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          {/* BOTÃO PIX */}
          <button 
            onClick={() => pagar(5.0, "áudio", "pix")} 
            disabled={loading}
            style={{
              backgroundColor: '#28a745',
              color: 'white',
              padding: '12px 20px',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: 'pointer',
              flex: 1
            }}
          >
            {loading && metodoSelecionado === 'pix' ? "🔄" : "💰"} PIX
          </button>

          {/* BOTÃO CARTÃO */}
          <button 
            onClick={() => pagar(5.0, "áudio", "cartao")} 
            disabled={loading}
            style={{
              backgroundColor: '#007bff',
              color: 'white',
              padding: '12px 20px',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: 'pointer',
              flex: 1
            }}
          >
            {loading && metodoSelecionado === 'cartao' ? "🔄" : "💳"} Cartão
          </button>
        </div>
      </div>

      {/* SERVIÇO VÍDEO */}
      <div style={{
        backgroundColor: '#f8f9fa',
        padding: '20px',
        borderRadius: '10px',
        margin: '20px 0',
        border: '2px solid #e9ecef'
      }}>
        <h3 style={{ color: '#007bff', marginBottom: '15px' }}>🎥 VÍDEO — R$ 8,00</h3>
        
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          {/* BOTÃO PIX */}
          <button 
            onClick={() => pagar(8.0, "vídeo", "pix")} 
            disabled={loading}
            style={{
              backgroundColor: '#28a745',
              color: 'white',
              padding: '12px 20px',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: 'pointer',
              flex: 1
            }}
          >
            {loading && metodoSelecionado === 'pix' ? "🔄" : "💰"} PIX
          </button>

          {/* BOTÃO CARTÃO */}
          <button 
            onClick={() => pagar(8.0, "vídeo", "cartao")} 
            disabled={loading}
            style={{
              backgroundColor: '#007bff',
              color: 'white',
              padding: '12px 20px',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: 'pointer',
              flex: 1
            }}
          >
            {loading && metodoSelecionado === 'cartao' ? "🔄" : "💳"} Cartão
          </button>
        </div>
      </div>

      {/* MENSAGEM SOBRE DEMORA DO PIX */}
      <div style={{
        margin: '20px 0', 
        padding: '15px',
        backgroundColor: '#fff3cd',
        border: '1px solid #ffeaa7',
        borderRadius: '5px',
        color: '#856404'
      }}>
        <strong>💡 Informações:</strong><br/>
        • <strong>PIX:</strong> Pode demorar alguns minutos para confirmar<br/>
        • <strong>Cartão:</strong> Confirmação instantânea
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
        🔄 Verificar Pagamento
      </button>

      {/* ÁREA DO PIX (só aparece se for PIX) */}
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
