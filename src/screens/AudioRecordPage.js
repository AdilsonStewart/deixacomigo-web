import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './AudioRecorder.css';

const AudioRecordPage = () => {
  const navigate = useNavigate();
  const [recording, setRecording] = useState(false);
  const [audioURL, setAudioURL] = useState('');
  const [audioBlob, setAudioBlob] = useState(null);
  const [time, setTime] = useState(0);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);

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

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioURL(audioUrl);
        setAudioBlob(audioBlob);
      };

      mediaRecorder.start();
      setRecording(true);
      
      // Timer
      setTime(0);
      timerRef.current = setInterval(() => {
        setTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Erro ao acessar microfone:', error);
      alert('Erro ao acessar o microfone. Verifique as permissões.');
    }
  };

  // Parar gravação
  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setRecording(false);
      clearInterval(timerRef.current);
    }
  };

  // Reproduzir áudio gravado
  const playAudio = () => {
    if (audioURL) {
      const audio = new Audio(audioURL);
      audio.play();
    }
  };

  // Download do áudio
  const downloadAudio = () => {
    if (audioBlob) {
      const url = URL.createObjectURL(audioBlob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `gravacao-${new Date().getTime()}.wav`;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  // Formatar tempo (mm:ss)
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Nova gravação
  const newRecording = () => {
    setAudioURL('');
    setAudioBlob(null);
    setTime(0);
  };

  return (
    <div className="audio-container">
      <h1 className="audio-title">Gravar Áudio</h1>
      
      {/* Timer */}
      <div className="timer">
        {formatTime(time)}
      </div>

      {/* Controles de gravação */}
      <div className="controls">
        {!recording && !audioURL && (
          <button className="btn-record" onClick={startRecording}>
            🎤 Iniciar Gravação
          </button>
        )}
        
        {recording && (
          <button className="btn-stop" onClick={stopRecording}>
            ⏹️ Parar Gravação
          </button>
        )}

        {audioURL && (
          <div className="playback-controls">
            <button className="btn-play" onClick={playAudio}>
              ▶️ Reproduzir
            </button>
            <button className="btn-download" onClick={downloadAudio}>
              📥 Download
            </button>
            <button className="btn-new" onClick={newRecording}>
              🔄 Nova Gravação
            </button>
          </div>
        )}
      </div>

      {/* Status */}
      <div className="status">
        {recording && <p className="recording-status">🎙️ Gravando...</p>}
        {audioURL && !recording && <p className="success-status">✅ Gravação concluída!</p>}
      </div>

      <button className="btn-back" onClick={() => navigate(-1)}>
        Voltar
      </button>
    </div>
  );
};

export default AudioRecordPage;
