import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, storage } from '../firebase/config';
import { collection, addDoc, doc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
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

  // Salvar gravação no Firestore
  const saveRecordingToFirestore = async (audioBlob, duration) => {
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
        status: 'pendente', // pendente, agendado, entregue
        fileName: snapshot.ref.name,
        storagePath: snapshot.ref.fullPath
      };

      const docRef = await addDoc(collection(db, 'gravacoes'), recordingData);
      
      console.log('Gravação salva com ID:', docRef.id);
      return docRef.id; // Retorna o ID para usar no agendamento

    } catch (error) {
      console.error('Erro ao salvar gravação:', error);
      throw error;
    }
  };

  // Parar gravação (atualizada)
  const stopRecording = async () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setRecording(false);
      clearInterval(timerRef.current);

      // Aguardar o blob ficar pronto e salvar no Firestore
      setTimeout(async () => {
        if (audioChunksRef.current.length > 0) {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
          const audioUrl = URL.createObjectURL(audioBlob);
          setAudioURL(audioUrl);
          setAudioBlob(audioBlob);

          try {
            // Salvar no Firestore
            const recordingId = await saveRecordingToFirestore(audioBlob, time);
            alert('✅ Gravação salva com sucesso! Agora você pode agendar a entrega.');
          } catch (error) {
            alert('❌ Erro ao salvar gravação. Tente novamente.');
          }
        }
      }, 100);
    }
  };

  // ... (outras funções permanecem iguais: startRecording, playAudio, etc.)

  // Nova gravação (atualizada)
  const newRecording = () => {
    setAudioURL('');
    setAudioBlob(null);
    setTime(0);
    audioChunksRef.current = [];
  };

  // Navegar para agendamento
  const goToAgendamento = () => {
    navigate('/agendamento');
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
            <button className="btn-schedule" onClick={goToAgendamento}>
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
            <p className="success-status">✅ Gravação concluída e salva!</p>
            <p className="info-status">Clique em "Agendar Entrega" para continuar</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ... (formatTime e export default permanecem)
