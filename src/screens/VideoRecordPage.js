import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase/firebase-client';

const VideoRecordPage = () => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const recorderRef = useRef(null);
  const chunks = useRef([]);

  const [recording, setRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [seconds, setSeconds] = useState(30);
  const [uploading, setUploading] = useState(false);
  const [gravacaoId] = useState(() => `VID-${Date.now()}`);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      })
      .catch(() => alert('Permita câmera e microfone!'));
  }, []);

  const start = () => {
    chunks.current = [];
    const recorder = new MediaRecorder(streamRef.current);
    recorderRef.current = recorder;
    recorder.ondataavailable = e => e.data.size > 0 && chunks.current.push(e.data);
    recorder.onstop = () => {
      const blob = new Blob(chunks.current, { type: 'video/webm' });
      setRecordedBlob(blob);
      setRecording(false);
      setSeconds(30);
      streamRef.current.getTracks().forEach(t => t.stop());
      if (videoRef.current) videoRef.current.srcObject = null;
    };
    recorder.start();
    setRecording(true);
    setSeconds(30);
  };

  const stop = () => recorderRef.current?.stop();

  const salvar = async () => {
    if (!recordedBlob) return;
    setUploading(true);
    const fileRef = ref(storage, `videos/video_${gravacaoId}.webm`);
    try {
      await uploadBytes(fileRef, recordedBlob);
      const url = await getDownloadURL(fileRef);
      localStorage.setItem('lastRecordingUrl', url);
      alert('Vídeo salvo!');
      navigate('/agendamento');
    } catch (e) {
      alert('Erro: ' + e.message);
    }
    setUploading(false);
  };

  const regravar = () => {
    setRecordedBlob(null);
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      });
  };

  useEffect(() => {
    if (recording && seconds > 0) {
      const t = setTimeout(() => setSeconds(s => s - 1), 1000);
      return () => clearTimeout(t);
    } else if (seconds === 0 && recording) stop();
  }, [recording, seconds]);

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#667eea,#764ba2)', color: 'white', textAlign: 'center', padding: '20px' }}>
      <h1 style={{ fontSize: '2.5rem' }}>Gravar Vídeo Surpresa</h1>
      <h3>ID: {gravacaoId}</h3>

      <video ref={videoRef} autoPlay muted playsInline style={{ width: '90%', maxWidth: '800px', borderRadius: '20px', background: '#000' }} />

      {recordedBlob && (
        <video src={URL.createObjectURL(recordedBlob)} controls autoPlay loop style={{ width: '90%', maxWidth: '800px', marginTop: '20px', borderRadius: '20px' }} />
      )}

      {recording && <div style={{ fontSize: '3rem', margin: '30px' }}>Gravando... {seconds}s</div>}

      {!recording && !recordedBlob && <button onClick={start} style={{ padding: '20px 60px', fontSize: '1.8rem', background: '#4CAF50', border: 'none', borderRadius: '50px' }}>Iniciar</button>}

      {recording && <button onClick={stop} style={{ padding: '20px 60px', fontSize: '1.8rem', background: '#f44336', border: 'none', borderRadius: '50px' }}>Parar</button>}

      {recordedBlob && !uploading && (
        <>
          <button onClick={salvar} style={{ padding: '20px 60px', background: '#FF9800', border: 'none', borderRadius: '50px' }}>Salvar e Agendar</button>
          <button onClick={regravar} style={{ padding: '20px 60px', background: '#666', border: 'none', borderRadius: '50px' }}>Regravar</button>
        </>
      )}

      {uploading && <p style={{ fontSize: '2rem' }}>Enviando...</p>}
    </div>
  );
};

export default VideoRecordPage;
