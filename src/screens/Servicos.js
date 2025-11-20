import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Servicos.css';

const Servicos = () => {
  const navigate = useNavigate();

  return (
    <div className="servicos-container">
      <h1 className="titulo">Serviços</h1>

      {/* GIF */}
      <img
        src="https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExZ3dqMDloZHlsM2sxY3RrMHQ3cjluYzBpYjlwNXFqNmI2ZXF1NjUxdCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/rKYYa2fMQNRfBwvtZJ/giphy.gif"
        alt="Serviços GIF"
        className="servicos-gif"
      />

      {/* Botões de Pagamento */}
      <button
        className="botao pagamento"
        onClick={() => navigate('/pagamento-audio')}
      >
        🎤 Áudio 30s — R$ 1,99
      </button>

      <button
        className="botao pagamento"
        onClick={() => navigate('/pagamento-video')}
      >
        🎬 Vídeo 30s — R$ 4,99
      </button>

      {/* Botão para gravar áudio */}
      <button 
        className="botao"
        onClick={() => navigate('/audiorecorder')}
      >
        Gravar Áudio
      </button>

      {/* Voltar */}
      <button 
        className="botao voltar" 
        onClick={() => navigate('/')}
      >
        Voltar
      </button>
    </div>
  );
};

export default Servicos;
