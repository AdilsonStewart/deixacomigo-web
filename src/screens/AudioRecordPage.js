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

  // Salvar gravação no Firebase
  const saveRecordingToFirebase = async (audioBlob, duration) => {
    setSaving(true);
    try {
      console.log('📤 Iniciando upload para Firebase Storage...');
      
      // 1. Upload do áudio para Firebase Storage
      const fileName = `audios/gravacao_${Date.now()}.wav`;
      const audioRef = ref(storage, fileName);
      console.log('📁 Fazendo upload do arquivo:', fileName);
      
      const snapshot = await uploadBytes(audioRef, audioBlob);
      console.log('✅ Upload do Storage concluído');
      
      const audioUrl = await getDownloadURL(snapshot.ref);
      console.log('🔗 URL gerada:', audioUrl);

      // 2. Salvar metadados no Firestore
      const recordingData = {
        tipo: 'audio',
        arquivoUrl: audioUrl,
        duracao: duration,
        nomeArquivo: snapshot.ref.name,
        caminhoStorage: snapshot.ref.fullPath,
        dataCriacao: new Date().toISOString(),
        status: 'salvo'
      };

      console.log('💾 Salvando no Firestore...', recordingData);
      
      const docRef = await addDoc(collection(db, 'audios'), recordingData);
      
      console.log('🎉 Gravacao salva no Firestore com ID:', docRef.id);
      
      localStorage.setItem('lastRecordingId', docRef.id);
      localStorage.setItem('lastRecordingUrl', audioUrl);
      
      return docRef.id;

    } catch (error) {
      console.error('❌ Erro ao salvar gravação:', error);
      throw error;
    } finally {
      setSaving(false);
    }
  };

  // Parar gravação automaticamente aos 30 segundos
  const stopRecordingAutomatically = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setRecording(false);
      clearInterval(timerRef.current);

      setTimeout(async () => {
        if (audioChunksRef.current.length > 0) {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
          const audioUrl = URL.createObjectURL(audioBlob);
          setAudioURL(audioUrl);

          try {
            await saveRecordingToFirebase(audioBlob, time);
            alert('✅ Áudio guardado! Prossiga para agendamento.');
          } catch (error) {
            alert('❌ Erro ao guardar áudio. Tente novamente.');
          }
        }
      }, 100);
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

      mediaRecorder.start();
      setRecording(true);
      setAudioURL('');
      setSaving(false);
      setTime(0);
      
      // Timer que para automaticamente em 30 segundos
      timerRef.current = setInterval(() => {
        setTime(prev => {
          const newTime = prev + 1;
          if (newTime >= 30) { // Para automaticamente em 30 segundos
            stopRecordingAutomatically();
          }
          return newTime;
        });
      }, 1000);

    } catch (error) {
      alert('Erro ao acessar microfone. Verifique as permissões.');
    }
  };

  // Parar gravação manual
  const stopRecording = () => {
    stopRecordingAutomatically();
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
    setSaving(false);
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
      <img 
        src="https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExeGU3djB5cHR4bjJuaXpwZDBrMnRwanJrMmJycDJ6YWt0bmN0OXVsbCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/PSo7PO7VvWgKuhq4r0/giphy.gif" 
        alt="Gravar áudio"
        className="audio-gif"
      />
      
      <h1 className="audio-title">Gravar Áudio</h1>
      
      <div className="timer">{formatTime(time)}</div>
      
      {/* Indicador de tempo máximo */}
      {recording && (
        <div className="time-limit">
          <p>Tempo máximo: 30 segundos</p>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{width: `${(time / 30) * 100}%`}}
            ></div>
          </div>
        </div>
      )}

      {/* FASE 1: GRAVAÇÃO */}
      {!audioURL && (
        <div className="recording-phase">
          {!recording ? (
            <button className="btn-record" onClick={startRecording}>
              🎤 Iniciar Gravação
            </button>
          ) : (
            <button className="btn-stop" onClick={stopRecording}>
              ⏹️ Parar Gravação
            </button>
          )}
        </div>
      )}

      {/* FASE 2: OUVIR E SALVAR */}
      {audioURL && !saving && (
        <div className="playback-phase">
          <button className="btn-play" onClick={playAudio}>
            ▶️ Ouvir Gravação
          </button>
          <p className="info-status">Áudio pronto para envio</p>
        </div>
      )}

      {/* FASE 3: SALVANDO */}
      {saving && (
        <div className="saving-phase">
          <p className="saving-status">⏳ Guardando seu áudio...</p>
        </div>
      )}

      {/* FASE 4: AGENDAR */}
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

