import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Sucesso.css';

export default function Sucesso() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('verificando');

  useEffect(() => {
    verificarPagamento();
  }, []);

  const verificarPagamento = async () => {
    try {
      // ✅ VERIFICA SE HÁ PAGAMENTO SALVO
      const paymentId = localStorage.getItem('ultimoPagamento');
      const tipoServico = localStorage.getItem('tipoServico');
      
      if (!paymentId) {
        setStatus('sem_info');
        return;
      }

      // ✅ CONSULTA O STATUS DO PAGAMENTO
      const response = await fetch("/.netlify/functions/verificar-pagamento-mp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId })
      });

      const data = await response.json();
      
      if (data.success && data.status === "approved") {
        setStatus('aprovado');
        // ✅ PAGAMENTO CONFIRMADO - REDIRECIONA
        setTimeout(() => {
          if (tipoServico === 'áudio') {
            navigate('/audiorecorder');
          } else if (tipoServico === 'vídeo') {
            navigate('/videorecorder');
          }
        }, 3000);
      } else {
        setStatus('pendente');
      }

    } catch (error) {
      console.error("Erro ao verificar pagamento:", error);
      setStatus('erro');
    }
  };

  // ⏳ VERIFICANDO
  if (status === 'verificando') {
    return (
      <div className="container sucesso-container">
        <div className="sucesso-card">
          <div className="sucesso-icon">⏳</div>
          <h1>Verificando Pagamento...</h1>
          <p>Aguarde enquanto confirmamos seu pagamento.</p>
        </div>
      </div>
    );
  }

  // ❌ SEM INFORMAÇÃO
  if (status === 'sem_info') {
    return (
      <div className="container sucesso-container">
        <div className="sucesso-card">
          <div className="sucesso-icon">❓</div>
          <h1>Informação Não Encontrada</h1>
          <p>Não encontramos informações do seu pagamento.</p>
          <button onClick={() => navigate('/servicos')} className="botao botao-sucesso">
            ↩️ Voltar aos Serviços
          </button>
        </div>
      </div>
    );
  }

  // ⏳ PENDENTE
  if (status === 'pendente') {
    return (
      <div className="container sucesso-container">
        <div className="sucesso-card">
          <div className="sucesso-icon">⏳</div>
          <h1>Pagamento Pendente</h1>
          <p>Seu pagamento ainda não foi confirmado.</p>
          <p>Pagamentos PIX podem levar alguns minutos.</p>
          <button onClick={verificarPagamento} className="botao botao-sucesso">
            🔄 Verificar Novamente
          </button>
          <button onClick={() => navigate('/servicos')} className="botao-voltar">
            Voltar para Início
          </button>
        </div>
      </div>
    );
  }

  // ❌ ERRO
  if (status === 'erro') {
    return (
      <div className="container sucesso-container">
        <div className="sucesso-card">
          <div className="sucesso-icon">❌</div>
          <h1>Erro na Verificação</h1>
          <p>Ocorreu um erro ao verificar seu pagamento.</p>
          <button onClick={verificarPagamento} className="botao botao-sucesso">
            🔄 Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  // ✅ APROVADO
  return (
    <div className="container sucesso-container">
      <div className="sucesso-card">
        <div className="sucesso-icon">✅</div>
        <h1 className="sucesso-titulo">Pagamento Aprovado!</h1>
        <p className="sucesso-mensagem">
          Seu pagamento foi confirmado com sucesso!
        </p>
        <p className="sucesso-detalhes">
          Agora você pode gravar seu áudio.
        </p>
        <p className="sucesso-redirecionamento">
          Redirecionando para gravação em 3 segundos...
        </p>
        
        <button 
          className="botao botao-sucesso"
          onClick={() => navigate('/audiorecorder')}
        >
          🎤 Fazer Gravação Agora
        </button>

        <button 
          className="botao-voltar"
          onClick={() => navigate('/')}
        >
          Voltar para Início
        </button>
      </div>
    </div>
  );
}
