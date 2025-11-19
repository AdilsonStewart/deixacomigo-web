import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Sucesso.css';

export default function Sucesso() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redireciona após 3 segundos
    const timer = setTimeout(() => {
      navigate('/audiorecorder');
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="container sucesso-container">
      <div className="sucesso-card">
        <div className="sucesso-icon">✅</div>
        <h1 className="sucesso-titulo">Pagamento Aprovado!</h1>
        <p className="sucesso-mensagem">
          Seu pagamento de R$ 1,99 foi aprovado com sucesso!
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

        {/* ACESSO DIRETO PARA TESTES */}
        <button 
          className="botao botao-teste"
          onClick={() => navigate('/audiorecorder')}
          style={{marginTop: '10px', backgroundColor: '#ff6b35'}}
        >
          🎤 Acesso Direto (Teste)
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
