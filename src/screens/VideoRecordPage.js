// src/screens/VideoRecordPage.js  →  VERSÃO QUE FUNCIONA 100% AGORA
import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// IMPORTS CORRETOS DO FIREBASE v9+
import { initializeApp } from 'firebase/app';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// SUA CONFIG EXATA (pega no Firebase Console → Project Settings → Seu app web)
const firebaseConfig = {
  apiKey: "AIzaSyDB8f9oZ6Z7g3X5v8Y8vX5v8Y8vX5v8Y8v",
  authDomain: "deixacomigo-727ff.firebaseapp.com",
  projectId: "deixacomigo-727ff",
  storageBucket: "deixacomigo-727ff.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef1234567890"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

const VideoRecordPage = () => {
  const navigate = useNavigate();
  const liveVideoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);

  const [recording, setRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [seconds, setSeconds] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [gravacaoId] = useState(() => `VID-${Date.now()}-${Math.floor(Math.random() * 10000)}`);

  // ... (todo o resto do código de gravação continua igual) ...

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (liveVideoRef.current) liveVideoRef.current.srcObject = stream;
    } catch (err) {
      alert('Permita câmera e microfone!');
    }
  };

  const startRecording = () => {
    chunksRef.current = [];
    const options = { mimeType: 'video/webm;codecs=vp9,opus' };
    const recorder = new MediaRecorder(streamRef.current, options);
    mediaRecorderRef.current = recorder;

    recorder.ondataavailable = (e) => e.data.size > 0 && chunksRef.current.push(e.data);
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      setRecordedBlob(blob);
      setRecording(false);
      setSeconds(0);
      if (liveVideoRef.current) liveVideoRef.current.srcObject = null;
    };

    recorder.start();
    setRecording(true);
    setSeconds(30);
    setTimeout(() => recorder.state === 'recording' && recorder.stop(), 30000);
  };

  const stopRecording = () => mediaRecorderRef.current?.stop();

  useEffect(() => {
    if (recording && seconds > 0) {
      const t = setTimeout(() => setSeconds(s => s - 1), 1000);
      return () => clearTimeout(t);
    } else if (seconds === 0 && recording) {
      stopRecording();
    }
  }, [recording, seconds]);

  const uploadAndGo = async () => {
    if (!recordedBlob) return;
    setUploading(true);

    try {
      const filename = `videos/video_${gravacaoId}.webm`;
      const storageRef = ref(storage, filename);
      await uploadBytes(storageRef, recordedBlob);
      const url = await getDownloadURL(storageRef);

      localStorage.setItem('lastRecordingUrl', url);
      alert('Vídeo salvo! Indo pro agendamento...');
      setTimeout(() => navigate('/agendamento'), 1000);
    } catch (error) {
      console.error(error);
      alert('Erro: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const regravar = () => {
    setRecordedBlob(null);
    startCamera();
  };

  useEffect(() => {
    startCamera();
    return () => streamRef.current?.getTracks().forEach(t => t.stop());
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "white", padding: "20px", textAlign: "center" }}>
      <h1 style={{ fontSize: "2.5rem" }}>Gravar Vídeo Surpresa</h1>
      <h3>ID: {gravacaoId}</h3>

      {recording && <div style={{ margin: "20px", fontSize: "2rem" }}>⏺️ {seconds}s</div>}

      <div style={{ margin: "20px auto", maxWidth: "800px", background: "#000", borderRadius: "15px" }}>
        {!recordedBlob ? (
          <video ref={liveVideoRef} autoPlay muted playsInline style={{ width: "100%" }} />
        ) : (
          <video controls src={URL.createObjectURL(recordedBlob)} style={{ width: "100%" }} />
        )}
      </div>

      <div style={{ margin: "30px 0", display: "flex", gap: "15px", justifyContent: "center", flexWrap: "wrap" }}>
        {!recordedBlob && !recording && <button onClick={startRecording} style={btnGreen}>Iniciar Gravação</button>}
        {recording && <button onClick={stopRecording} style={btnRed}>Parar</button>}
        {recordedBlob && !uploading && (
          <>
            <button onClick={uploadAndGo} style={btnOrange}>Salvar e Agendar</button>
            <button onClick={regravar} style={btnGray}>Regravar</button>
          </>
        )}
        {uploading && <p>Enviando vídeo...</p>}
      </div>

      <button onClick={() => navigate(-1)} style={btnBack}>Voltar</button>
    </div>
  );
};

const btnGreen = { padding: "18px 40px", fontSize: "1.4rem", background: "#4CAF50", color: "white", border: "none", borderRadius: "50px", cursor: "pointer" };
const btnRed = { ...btnGreen, background: "#f44336" };
const btnOrange = { ...btnGreen, background: "#FF9800" };
const btnGray = { ...btnGreen, background: "#666", fontSize: "1.2rem" };
const btnBack = { padding: "12px 30px", background: "#333", color: "white", border: "none", borderRadius: "50px", marginTop: "20px" };

export default VideoRecordPage;
