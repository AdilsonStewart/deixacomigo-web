import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Sucesso2.css';

const Sucesso2 = () => {
  const navigate = useNavigate();

  // Após 3 segundos → vai para a VideoRecorderPage
  useEffect(() => {
    const timer = setTimeout(() => {
      // Tenta usar navigate, se não funcionar, usa window.location
      navigate('/videorecorder');
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  const handleClick = () => {
    navigate('/videorecorder');
  };

  return (
    <div className="sucesso2-container">
      <img
        className="sucesso2-gif"
        src="https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExbDg4aHBpM2V0cG50N2phN3R0M2txdzZkY3hucDJpN2gyNmlrYzV4NCZlcD12MV9pbnRlrm9uYWxfZ2lmX2J5X2lkJmN0PWc/26xBIygOcC3bAWg3S/giphy.gif"
        alt="Sucesso"
      />

      <h1>Pagamento Aprovado!</h1>
      <p>Redirecionando para gravação de vídeo em 3 segundos...</p>
      
      <button 
        className="botao-ir-agora"
        onClick={handleClick}
      >
        🎥 Ir para Gravação Agora
      </button>
    </div>
  );
};

export default Sucesso2;
