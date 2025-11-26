// src/screens/VideoRecordPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './VideoRecorder.css'; // apenas CSS puro aqui

const VideoRecordPage = () => {
  const navigate = useNavigate();
  const [recording, setRecording] = useState(false);
  const [videoUrl, setVideoUrl] = useState(null);

  // ✅ FUNÇÃO SIMULADA DE GRAVAÇÃO (PARA DEMONSTRAÇÃO)
  const startRecording = () => {
    setRecording(true);
    // Simula uma gravação de 3 segundos
    setTimeout(() => {
      setRecording(false);
      setVideoUrl("https://exemplo.com/video-gravado.mp4"); // URL simulada
      alert("🎥 Vídeo gravado com sucesso! (Simulação)");
    }, 3000);
  };

  const stopRecording = () => {
    setRecording(false);
  };

  const handleSubmit = () => {
    alert("✅ Vídeo enviado para processamento!");
    navigate('/agendamento'); // Vai para agendamento após gravar
  };

  return (
    <div className="video-container">
      <h1 className="video-title">🎥 Gravar Vídeo Surpresa</h1>
      
      <div className="video-instructions">
        <h3>Como funciona:</h3>
        <ol>
          <li>Clique em "Iniciar Gravação"</li>
          <li>Grave sua mensagem especial (até 2 minutos)</li>
          <li>Clique em "Parar Gravação"</li>
          <li>Envie e agende a entrega</li>
        </ol>
      </div>

      {/* ✅ ÁREA DE GRAVAÇÃO SIMULADA */}
      <div className="video-preview">
        {recording ? (
          <div className="recording-indicator">
            <div className="recording-dot"></div>
            <span>GRAVANDO... ⏺️</span>
          </div>
        ) : videoUrl ? (
          <div className="video-preview-placeholder">
            <p>✅ Vídeo Gravado!</p>
            <p>Pronto para enviar</p>
          </div>
        ) : (
          <div className="video-preview-placeholder">
            <p>📹 Área de Gravação</p>
            <p>Clique no botão abaixo para começar</p>
          </div>
        )}
      </div>

      {/* ✅ BOTÕES DE CONTROLE */}
      <div className="video-controls">
        {!recording && !videoUrl && (
          <button className="btn-record" onClick={startRecording}>
            🎬 Iniciar Gravação
          </button>
        )}
        
        {recording && (
          <button className="btn-stop" onClick={stopRecording}>
            ⏹️ Parar Gravação
          </button>
        )}
        
        {videoUrl && (
          <button className="btn-submit" onClick={handleSubmit}>
            ✅ Enviar Vídeo
          </button>
        )}
        
        <button className="btn-back" onClick={() => navigate('/')}>
          ↩️ Voltar para Início
        </button>
      </div>

      {/* ✅ INSTRUÇÕES EXTRAS */}
      <div className="video-tips">
        <h4>💡 Dicas para um vídeo perfeito:</h4>
        <ul>
          <li>Encontre um local bem iluminado</li>
          <li>Fique em um ambiente silencioso</li>
          <li>Fale com carinho e emoção</li>
          <li>Mantenha a câmera estabilizada</li>
        </ul>
      </div>
    </div>
  );
};

export default VideoRecordPage;
