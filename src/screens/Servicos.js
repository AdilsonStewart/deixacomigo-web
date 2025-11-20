import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Servicos.css';

const Servicos = () => {
  const navigate = useNavigate();

  return (
    <div className="container">
      <h1 className="titulo">Serviços</h1>

      <img 
        className="gif-servicos"
        src="https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExZ3dqMDloZHlsM2sxY3RrMHQ3cjluYzBpYjlwNXFqNmI2ZXF1NjUxdCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/rKYYa2fMQNRfBwvtZJ/giphy.gif"
        alt="Animação serviços"
      />

      <button 
        className="botao botao-audio"
        onClick={() => navigate('/pagamento-audio')}
      >
        Áudio 30s — R$ 1,99
      </button>

      <button 
        className="botao botao-video"
        onClick={() => navigate('/pagamento-video')}
      >
        Vídeo 30s — R$ 4,99
      </button>

      <button 
        className="voltar-text"
        onClick={() => navigate('/')}
      >
        Voltar
      </button>
    </div>
  );
};

export default Servicos;
