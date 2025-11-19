import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './AudioRecorder.css';

const AudioRecordPage = () => {
  const navigate = useNavigate();
  const [recording, setRecording] = useState(false);
  const [audioURL, setAudioURL] = useState('');
  const [time, setTime] = useState(0);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);

  // Salvar gravação localmente
  const saveRecordingLocally = (duration) => {
    const recordingData = {
      id: 'rec_' + Date.now(),
      duration: duration,
      timestamp: new Date().toISOString(),
      status: 'pendente'
    };
    
    // Salvar no localStorage
    localStorage.setItem('lastRecording', JSON.stringify(recordingData));
    localStorage.setItem('lastRecordingId', recordingData.id);
    
    return recordingData.id;
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
      setTime(0);
      
      timerRef.current = setInterval(() => {
        setTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      alert('Erro ao acessar microfone. Verifique as permissões.');
    }
  };

  // Parar gravação
  const stopRecording = async () => {
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

          // Salvar localmente
          saveRecordingLocally(time);
          alert('✅ Gravação salva! Clique em "Agendar Entrega".');
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

  // Download
  const downloadAudio = () => {
    if (audioURL) {
      const a = document.createElement('a');
      a.href = audioURL;
      a.download = `gravacao-${Date.now()}.wav`;
      a.click();
    }
  };

  // Nova gravação
  const newRecording = () => {
    setAudioURL('');
    setTime(0);
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
            <button className="btn-schedule" onClick={() => navigate('/agendamento')}>
              📅 Agendar Entrega
            </button>
            <button className="btn-new" onClick={newRecording}>
              🔄 Nova Gravação
            </button>
          </div>
        )}
      </div>

      <div className="status">
        {recording && <p className="recording-status">🎙️ Gravando...</p>}
        {audioURL && !recording && (
          <div>
            <p className="success-status">✅ Gravação concluída!</p>
            <p className="info-status">Pronto para agendar a entrega</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AudioRecordPage;
