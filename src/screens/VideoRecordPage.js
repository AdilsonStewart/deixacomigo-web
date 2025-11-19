import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './VideoRecorder.css';

const VideoRecordPage = () => {
  const navigate = useNavigate();
  const [recording, setRecording] = useState(false);
  const [videoURL, setVideoURL] = useState('');
  const [time, setTime] = useState(0);
  const [saved, setSaved] = useState(false);
  const mediaRecorderRef = useRef(null);
  const videoChunksRef = useRef([]);
  const timerRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Salvar gravação localmente
  const saveRecording = () => {
    const recordingData = {
      id: 'vid_' + Date.now(),
      duration: time,
      timestamp: new Date().toISOString(),
      type: 'video',
      status: 'salvo'
    };
    
    localStorage.setItem('lastRecording', JSON.stringify(recordingData));
    localStorage.setItem('lastRecordingId', recordingData.id);
    setSaved(true);
    alert('✅ Vídeo salvo com sucesso!');
  };

  // Iniciar gravação de vídeo
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      streamRef.current = stream;
      
      // Mostrar preview do vídeo
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9,opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      videoChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          videoChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start();
      setRecording(true);
      setVideoURL('');
      setSaved(false);
      setTime(0);
      
      timerRef.current = setInterval(() => {
        setTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Erro ao acessar câmera:', error);
      alert('Erro ao acessar câmera e microfone. Verifique as permissões.');
    }
  };

  // Parar gravação
  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      
      // Parar todas as tracks da stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      
      setRecording(false);
      clearInterval(timerRef.current);

      // Limpar preview
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }

      setTimeout(() => {
        if (videoChunksRef.current.length > 0) {
          const videoBlob = new Blob(videoChunksRef.current, { type: 'video/webm' });
          const videoUrl = URL.createObjectURL(videoBlob);
          setVideoURL(videoUrl);
        }
      }, 100);
    }
  };

  // Nova gravação
  const newRecording = () => {
    setVideoURL('');
    setTime(0);
    setSaved(false);
    videoChunksRef.current = [];
  };

  // Formatar tempo
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="video-container">
      <h1 className="video-title">Gravar Vídeo</h1>
      
      <div className="timer">{formatTime(time)}</div>

      {/* Preview da Câmera */}
      <div className="video-preview">
        <video 
          ref={videoRef}
          autoPlay 
          muted 
          playsInline
          className="camera-preview"
        />
      </div>

      {/* FASE 1: GRAVAÇÃO */}
      {!videoURL && (
        <div className="recording-phase">
          {!recording ? (
            <button className="btn-record" onClick={startRecording}>
              🎥 Gravar Vídeo
            </button>
          ) : (
            <button className="btn-stop" onClick={stopRecording}>
              ⏹️ Parar Gravação
            </button>
          )}
        </div>
      )}

      {/* FASE 2: ASSISTIR E SALVAR */}
      {videoURL && !saved && (
        <div className="playback-phase">
          <div className="phase-title">Assistir Gravação</div>
          <video 
            ref={videoRef}
            src={videoURL}
            controls
            className="video-playback"
          />
          <div className="video-controls">
            <button className="btn-save" onClick={saveRecording}>
              💾 Salvar Vídeo
            </button>
            <button className="btn-new" onClick={newRecording}>
              🔄 Nova Gravação
            </button>
          </div>
        </div>
      )}

      {/* FASE 3: AGENDAR (após salvar) */}
      {saved && (
        <div className="schedule-phase">
          <div className="phase-title">Vídeo Salvo!</div>
          <p className="success-message">Seu vídeo foi salvo com sucesso.</p>
          <button className="btn-schedule" onClick={() => navigate('/agendamento')}>
            📅 Agendar Entrega
          </button>
          <button className="btn-new" onClick={newRecording}>
            🔄 Fazer Nova Gravação
          </button>
        </div>
      )}

      <div className="status">
        {recording && <p className="recording-status">🎥 Gravando vídeo...</p>}
        {videoURL && !saved && <p className="playback-status">✅ Gravação concluída - Assista e salve</p>}
      </div>
    </div>
  );
};

export default VideoRecordPage;
