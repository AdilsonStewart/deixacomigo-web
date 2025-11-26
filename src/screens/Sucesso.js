import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Sucesso.css';

export default function Sucesso() {
  const navigate = useNavigate();

  useEffect(() => {
    // ✅ REDIRECIONAMENTO AUTOMÁTICO APÓS 3 SEGUNDOS
    const timer = setTimeout(() => {
      const tipoServico = localStorage.getItem('tipoServico');
      const destino = tipoServico === 'vídeo' ? '/videorecorder' : '/audiorecorder';
      navigate(destino);
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  const tipoServico = localStorage.getItem('tipoServico');
  const destino = tipoServico === 'vídeo' ? '/videorecorder' : '/audiorecorder';

  return (
    <div className="container sucesso-container">
      <div className="sucesso-card">
        
        {/* ✅ OLHINHO DE CORAÇÃO FOFO */}
        <div className="sucesso-icon">😍</div>
        
        <h1 className="sucesso-titulo">PARABÉNS!</h1>
        
        <p className="sucesso-mensagem">
          Sua compra foi aprovada com sucesso!
        </p>
        
        <p className="sucesso-detalhes">
          Agora é hora de gravar sua mensagem especial com todo carinho!
        </p>
        
        <p className="sucesso-redirecionamento">
          Redirecionando para gravação em 3 segundos...
        </p>
        
        {/* ✅ BOTÃO COM EMOJI FOFO */}
        <button 
          className="botao botao-sucesso"
          onClick={() => navigate(destino)}
        >
          🎤 Gravar Minha Mensagem Agora
        </button>

      </div>
    </div>
  );
}
