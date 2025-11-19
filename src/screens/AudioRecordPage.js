import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './AudioRecorder.css';

const AudioRecordPage = () => {
  const navigate = useNavigate();
  const [recording, setRecording] = useState(false);
  const [audioURL, setAudioURL] = useState('');
  const [time, setTime] = useState(0);
  const [saved, setSaved] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);

  // Salvar gravação localmente
  const saveRecording = () => {
    const recordingData = {
      id: 'rec_' + Date.now(),
      duration: time,
      timestamp: new Date().toISOString(),
      status: 'salvo'
    };
    
    localStorage.setItem('lastRecording', JSON.stringify(recordingData));
    localStorage.setItem('lastRecordingId', recordingData.id);
    setSaved(true);
    alert('✅ Áudio salvo com sucesso!');
  };

  // Iniciar gravação
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.start();
      setRecording(true);
      setAudioURL('');
      setSaved(false);
      setTime(0);
      
      timerRef.current = setInterval(() => {
        setTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      alert('Erro ao acessar microfone. Verifique as permissões.');
    }
  };

  // Parar gravação
  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setRecording(false);
      clearInterval(timerRef.current);

      setTimeout(() => {
        if (audioChunksRef.current.length > 0) {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
          const audioUrl = URL.createObjectURL(audioBlob);
          setAudioURL(audioUrl);
        }
      }, 100);
    }
  };

  // Reproduzir áudio
  const playAudio = () => {
    if (audioURL) {
      const audio = new Audio(audioURL);
      audio.play();
    }
  };

  // Nova gravação
  const newRecording = () => {
    setAudioURL('');
    setTime(0);
    setSaved(false);
    audioChunksRef.current = [];
  };

  // Formatar tempo
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="audio-container">
      <h1 className="audio-title">Gravar Áudio</h1>
      
      <div className="timer">{formatTime(time)}</div>

      {/* FASE 1: GRAVAÇÃO */}
      {!audioURL && (
        <div className="recording-phase">
          {!recording ? (
            <button className="btn-record" onClick={startRecording}>
              🎤 Gravar Áudio
            </button>
          ) : (
            <button className="btn-stop" onClick={stopRecording}>
              ⏹️ Parar Gravação
            </button>
          )}
        </div>
      )}

      {/* FASE 2: OUVIR E SALVAR */}
      {audioURL && !saved && (
        <div className="playback-phase">
          <div className="phase-title">Ouvir Gravação</div>
          <button className="btn-play" onClick={playAudio}>
            ▶️ Ouvir Gravação
          </button>
          <button className="btn-save" onClick={saveRecording}>
            💾 Salvar Áudio
          </button>
          <button className="btn-new" onClick={newRecording}>
            🔄 Nova Gravação
          </button>
        </div>
      )}

      {/* FASE 3: AGENDAR (após salvar) */}
      {saved && (
        <div className="schedule-phase">
          <div className="phase-title">Áudio Salvo!</div>
          <p className="success-message">Seu áudio foi salvo com sucesso.</p>
          <button className="btn-schedule" onClick={() => navigate('/agendamento')}>
            📅 Agendar Entrega
          </button>
          <button className="btn-new" onClick={newRecording}>
            🔄 Fazer Nova Gravação
          </button>
        </div>
      )}

      <div className="status">
        {recording && <p className="recording-status">🎙️ Gravando...</p>}
        {audioURL && !saved && <p className="playback-status">✅ Gravação concluída - Ouça e salve</p>}
      </div>
    </div>
  );
};

export default AudioRecordPage;
