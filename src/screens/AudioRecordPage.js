import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, storage } from '../firebase/config';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import './AudioRecorder.css';

const AudioRecordPage = () => {
  const navigate = useNavigate();
  const [recording, setRecording] = useState(false);
  const [audioURL, setAudioURL] = useState('');
  const [audioBlob, setAudioBlob] = useState(null);
  const [time, setTime] = useState(0);
  const [saving, setSaving] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);

  // Salvar gravação no Firestore
  const saveRecordingToFirestore = async (audioBlob, duration) => {
    setSaving(true);
    try {
      // 1. Upload do áudio para Firebase Storage
      const audioRef = ref(storage, `audios/gravacao_${Date.now()}.wav`);
      const snapshot = await uploadBytes(audioRef, audioBlob);
      const audioUrl = await getDownloadURL(snapshot.ref);

      // 2. Salvar metadados no Firestore
      const recordingData = {
        audioUrl: audioUrl,
        duration: duration,
        timestamp: new Date().toISOString(),
        status: 'pendente',
        fileName: snapshot.ref.name,
        storagePath: snapshot.ref.fullPath
      };

      const docRef = await addDoc(collection(db, 'gravacoes'), recordingData);
      
      console.log('Gravação salva com ID:', docRef.id);
      // Salvar o ID para usar no agendamento
      localStorage.setItem('lastRecordingId', docRef.id);
      return docRef.id;

    } catch (error) {
      console.error('Erro ao salvar gravação:', error);
      throw error;
    } finally {
      setSaving(false);
    }
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

      mediaRecorder.onstop = () => {
        // Esta função será chamada quando stopRecording() for executado
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
  const stopRecording = async () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setRecording(false);
      clearInterval(timerRef.current);

      // Aguardar e salvar no Firebase
      setTimeout(async () => {
        if (audioChunksRef.current.length > 0) {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
          const audioUrl = URL.createObjectURL(audioBlob);
          setAudioURL(audioUrl);
          setAudioBlob(audioBlob);

          try {
            await saveRecordingToFirestore(audioBlob, time);
          } catch (error) {
            alert('❌ Erro ao salvar gravação. Tente novamente.');
          }
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

  // Formatar tempo
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
    audioChunksRef.current = [];
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
        {saving && <p className="saving-status">💾 Salvando gravação...</p>}
        {audioURL && !recording && !saving && (
          <div>
            <p className="success-status">✅ Gravação salva com sucesso!</p>
            <p className="info-status">Clique em "Agendar Entrega" para continuar</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AudioRecordPage;
