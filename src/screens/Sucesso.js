import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Sucesso.css';

export default function Sucesso() {
  const navigate = useNavigate();

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
        
        <button 
          className="botao botao-sucesso"
          onClick={() => navigate('/servicos')}
        >
          🎤 Fazer Gravação
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

