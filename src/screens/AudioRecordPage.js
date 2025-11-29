import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, storage } from '../firebase/firebase-client';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import './AudioRecorder.css';

const AudioRecordPage = () => {
  const navigate = useNavigate();
  const [recording, setRecording] = useState(false);
  const [audioURL, setAudioURL] = useState('');
  const [time, setTime] = useState(0);
  const [saving, setSaving] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const alreadyStoppedRef = useRef(false); // <<< EVITA DUPLA PARADA

  const saveRecordingToFirebase = async (audioBlob, duration) => {
    setSaving(true);
    try {
      const fileName = `audios/gravacao_${Date.now()}.wav`;
      const audioRef = ref(storage, fileName);

      const snapshot = await uploadBytes(audioRef, audioBlob);
      const audioUrl = await getDownloadURL(snapshot.ref);

      const recordingData = {
        tipo: 'audio',
        arquivoUrl: audioUrl,
        duracao: duration,
        nomeArquivo: snapshot.ref.name,
        caminhoStorage: snapshot.ref.fullPath,
        dataCriacao: new Date().toISOString(),
        status: 'salvo'
      };

      const docRef = await addDoc(collection(db, 'audios'), recordingData);

      localStorage.setItem('lastRecordingId', docRef.id);
      localStorage.setItem('lastRecordingUrl', audioUrl);

    } catch (error) {
      alert('❌ Erro ao guardar áudio.');
    } finally {
      setSaving(false);
    }
  };

  // --- PARADA CENTRALIZADA ---
  const stopRecordingCentral = () => {
    if (alreadyStoppedRef.current) return; // <<< evita segunda execução
    alreadyStoppedRef.current = true;

    if (!mediaRecorderRef.current) return;

    try {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
    } catch {}

    setRecording(false);
    clearInterval(timerRef.current);

    setTimeout(async () => {
      if (audioChunksRef.current.length > 0) {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);

        try {
          await saveRecordingToFirebase(audioBlob, time);
        } catch {}
      }
    }, 150);
  };

  const startRecording = async () => {
    if (saving) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      alreadyStoppedRef.current = false;
      audioChunksRef.current = [];
      setAudioURL('');
      setSaving(false);
      setTime(0);

      mediaRecorder.ondataavailable = (e) => {
        audioChunksRef.current.push(e.data);
      };

      mediaRecorder.start();
      setRecording(true);

      timerRef.current = setInterval(() => {
        setTime(prev => {
          if (prev + 1 >= 30) {
            stopRecordingCentral(); // <<< só aqui chama
          }
          return prev + 1;
        });
      }, 1000);

    } catch {
      alert('Erro ao acessar microfone.');
    }
  };

  const stopRecording = () => {
    stopRecordingCentral(); // <<< mesma função central
  };

  const playAudio = () => {
    if (audioURL) new Audio(audioURL).play();
  };

  const newRecording = () => {
    setAudioURL('');
    setTime(0);
    setSaving(false);
    audioChunksRef.current = [];
    alreadyStoppedRef.current = false;
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="audio-container">
      <img 
        src="https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExeGU3djB5cHR4bjJuaXpwZDBrMnRwanJrMmJycDJ6YWt0bmN0OXVsbCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/PSo7PO7VvWgKuhq4r0/giphy.gif" 
        alt="Gravar áudio"
        className="audio-gif"
      />

      <h1 className="audio-title">Gravar Áudio</h1>
      
      <div className="timer">{formatTime(time)}</div>

      {recording && (
        <div className="time-limit">
          <p>Tempo máximo: 30 segundos</p>
          <div className="progress-bar">
            <div className="progress-fill" style={{width: `${(time / 30) * 100}%`}}></div>
          </div>
        </div>
      )}

      {!audioURL && (
        <div className="recording-phase">
          {!recording ? (
            <button className="btn-record" onClick={startRecording} disabled={saving}>
              🎤 Iniciar Gravação
            </button>
          ) : (
            <button className="btn-stop" onClick={stopRecording}>
              ⏹️ Parar Gravação
            </button>
          )}
        </div>
      )}

      {audioURL && !saving && (
        <div className="playback-phase">
          <button className="btn-play" onClick={playAudio}>▶️ Ouvir Gravação</button>
        </div>
      )}

      {saving && (
        <div className="saving-phase">
          <p className="saving-status">⏳ Guardando seu áudio...</p>
        </div>
      )}

      {audioURL && !saving && (
        <div className="schedule-phase">
          <button className="btn-schedule" onClick={() => navigate('/agendamento')}>
            📅 Agendar Entrega
          </button>
          <button className="btn-new" onClick={newRecording}>
            🔄 Nova Gravação
          </button>
        </div>
      )}

      <div className="status">
        {recording && <p className="recording-status">🎙️ Gravando... {30 - time}s restantes</p>}
        {audioURL && !saving && <p className="success-status">✅ Áudio processado</p>}
      </div>
    </div>
  );
};

export default AudioRecordPage;
