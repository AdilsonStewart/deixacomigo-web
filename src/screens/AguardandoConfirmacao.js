import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AguardandoConfirmacao() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('verificando');
  const [tentativas, setTentativas] = useState(0);

  useEffect(() => {
    verificarPagamento();
    const interval = setInterval(verificarPagamento, 10000); // Verifica a cada 10 segundos
    return () => clearInterval(interval);
  }, []);

  const verificarPagamento = async () => {
    const paymentId = localStorage.getItem('ultimoPagamento');
    const tipoServico = localStorage.getItem('tipoServico');
    
    if (!paymentId) {
      setStatus('erro');
      return;
    }

    try {
      const response = await fetch("/.netlify/functions/verificar-pagamento-mp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId })
      });

      const data = await response.json();
      setTentativas(tentativas + 1);
      
      if (data.success && data.status === "approved") {
        setStatus('aprovado');
        // Redireciona automaticamente após 3 segundos
        setTimeout(() => {
          if (tipoServico === 'áudio') navigate('/audiorecorder');
          else if (tipoServico === 'vídeo') navigate('/videorecorder');
        }, 3000);
      } else if (tentativas > 6) { // 1 minuto tentando
        setStatus('timeout');
      } else {
        setStatus('pendente');
      }
    } catch (error) {
      setStatus('erro');
    }
  };

  const getMensagem = () => {
    switch(status) {
      case 'verificando': return "🔍 Verificando pagamento...";
      case 'pendente': return "⏳ Aguardando confirmação do banco...";
      case 'aprovado': return "✅ Pagamento confirmado!";
      case 'timeout': return "❌ Tempo esgotado - pagamento não confirmado";
      case 'erro': return "❌ Erro na verificação";
      default: return "Processando...";
    }
  };

  return (
    <div style={{ maxWidth: "500px", margin: "50px auto", textAlign: "center" }}>
      <img 
        src="https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExc2ptcWV6bGhpdTF4cWJhd25yanZvNGVpb25vcGhiaGY1d2Qya3NraiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/MYzuiycbNu0J9lKrcz/giphy.gif" 
        alt="coruja" 
        style={{ width: "150px", borderRadius: "50%" }} 
      />
      
      <h1 style={{ marginTop: '20px' }}>{getMensagem()}</h1>
      
      {status === 'pendente' && (
        <div>
          <p>Pagamentos PIX podem levar alguns minutos</p>
          <p>Tentativa: {tentativas}/6</p>
          <button onClick={verificarPagamento} style={{ marginTop: '10px' }}>
            🔄 Verificar Agora
          </button>
        </div>
      )}
      
      {status === 'aprovado' && (
        <div>
          <p>Redirecionando automaticamente em 3 segundos...</p>
          <button 
            onClick={() => {
              const tipoServico = localStorage.getItem('tipoServico');
              if (tipoServico === 'áudio') navigate('/audiorecorder');
              else if (tipoServico === 'vídeo') navigate('/videorecorder');
            }}
            style={{ marginTop: '10px', backgroundColor: '#28a745', color: 'white' }}
          >
            🎯 Prosseguir Agora
          </button>
        </div>
      )}
      
      {(status === 'timeout' || status === 'erro') && (
        <button 
          onClick={() => navigate('/servicos')}
          style={{ marginTop: '10px' }}
        >
          ↩️ Voltar aos Serviços
        </button>
      )}
    </div>
  );
}
