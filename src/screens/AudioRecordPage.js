import React from 'react';
import { useNavigate } from 'react-router-dom';
import './AudioRecorder.css';

const AudioRecorderPage = () => {
  const navigate = useNavigate();

  return (
    <div className="audio-container">
      <h1 className="audio-title">Gravar Áudio</h1>
      <p className="audio-sub">Funcionalidade em desenvolvimento...</p>
      
      <button 
        className="audio-btn" 
        onClick={() => navigate(-1)}
      >
        Voltar
      </button>
    </div>
  );
};

export default AudioRecorderPage;
