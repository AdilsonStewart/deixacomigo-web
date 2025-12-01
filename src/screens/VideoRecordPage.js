// src/screens/VideoRecordPage.js
import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const VideoRecordPage = () => {
  const navigate = useNavigate();
  const liveVideoRef = useRef(null);     // só pra câmera ao vivo
  const previewRef = useRef(null);       // ← NOVO: só pro vídeo gravado
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);

  const [recording, setRecording] = useState(false);
  const [recordedUrl, setRecordedUrl] = useState('');
  const [seconds, setSeconds] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [gravacaoId, setGravacaoId] = useState('');

  const generateId = () => `VID-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: true
      });
      streamRef.current = stream;
      if (liveVideoRef.current) {
        liveVideoRef.current.srcObject = stream;
      }
    } catch (err) {
      alert('Erro ao acessar câmera/microfone!');
    }
  };

  const startRecording = () => {
    if (!streamRef.current) return;
    chunksRef.current = [];

    const options = { mimeType: 'video/mp4' };
    if (!MediaRecorder.isTypeSupported('video/mp4')) {
      options.mimeType = 'video/webm;codecs=vp9,opus';
    }

    const recorder = new MediaRecorder(streamRef.current, options);
    mediaRecorderRef.current = recorder;

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/mp4' });
      const url = URL.createObjectURL(blob);
      const id = generateId();
      setRecordedUrl(url);
      setGravacaoId(id);
      setRecording(false);
      setSeconds(0);

      // AQUI É O SEGREDO: limpa a câmera e mostra o vídeo gravado
      if (liveVideoRef.current) liveVideoRef.current.srcObject = null;
      if (previewRef.current) previewRef.current.src = url;
    };

    recorder.start();
    setRecording(true);
    setSeconds(30);
    setTimeout(() => {
      if (recorder.state === 'recording') recorder.stop();
    }, 30000);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  useEffect(() => {
    if (recording && seconds > 0) {
      const t = setTimeout(() => setSeconds(s => s - 1), 1000);
      return () => clearTimeout(t);
    } else if (seconds === 0 && recording) {
      stopRecording();
    }
  }, [recording, seconds]);

  const uploadAndGo = async () => {
    if (!recordedUrl) return;
    setUploading(true);
    try {
      const blob = await fetch(recordedUrl).then(r => r.blob());
      const formData = new FormData();
      formData.append('video', blob, `${gravacaoId}.mp4`);
      formData.append('tipo', 'video');

      const res = await fetch('/.netlify/functions/salvar-video', {
        method: 'POST',
        body: formData
      });

      const json = await res.json();
      if (json.success) {
        localStorage.setItem('lastRecordingUrl', json.url);
        alert('Vídeo salvo! Indo pro agendamento...');
        setTimeout(() => navigate('/agendamento'), 1000);
      } else {
        alert('Erro: ' + json.error);
      }
    } catch (err) {
      alert('Erro de conexão.');
    } finally {
      setUploading(false);
    }
  };

  const regravar = () => {
    setRecordedUrl('');
    setGravacaoId('');
    previewRef.current.src = '';
    startCamera();
  };

  useEffect(() => {
    startCamera();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      color: "white",
      padding: "20px",
      textAlign: "center",
      fontFamily: "Arial, sans-serif"
    }}>
      <h1 style={{ fontSize: "2.5rem" }}>Gravar Vídeo Surpresa</h1>
      {gravacaoId && <h3>ID: {gravacaoId}</h3>}

      {recording && (
        <div style={{ margin: "20px 0", fontSize: "2rem" }}>
          <div style={{
            display: "inline-block",
            width: 80, height: 80,
            border: "6px solid #ff3333",
            borderRadius: "50%",
            animation: "pulse 1.5s infinite"
          }}></div>
          <p>{seconds}s</p>
        </div>
      )}

      {/* TELA AO VIVO OU VÍDEO GRAVADO */}
      <div style={{ margin: "20px auto", maxWidth: "800px", background: "#000", borderRadius: "15px", overflow: "hidden" }}>
        {!recordedUrl ? (
          <video ref={liveVideoRef} autoPlay muted playsInline style={{ width: "100%" }} />
        ) : (
          <video ref={previewRef} controls style={{ width: "100%" }} />
        )}
      </div>

      {/* BOTÕES */}
      <div style={{ margin: "30px 0", display: "flex", gap: "15px", justifyContent: "center", flexWrap: "wrap" }}>
        {!recordedUrl && !recording && (
          <button onClick={startRecording} style={btnGreen}>Iniciar Gravação</button>
        )}
        {recording && (
          <button onClick={stopRecording} style={btnRed}>Parar</button>
        )}
        {recordedUrl && !uploading && (
          <>
            <button onClick={uploadAndGo} style={btnOrange}>Salvar e Agendar</button>
            <button onClick={regravar} style={btnGray}>Regravar</button>
          </>
        )}
        {uploading && <p>Enviando...</p>}
      </div>

      <button onClick={() => navigate(-1)} style={btnBack}>Voltar</button>

      <style jsx>{`
        @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(255,0,0,0.7); } 70% { box-shadow: 0 0 0 20px rgba(255,0,0,0); } 100% { box-shadow: 0 0 0 0 rgba(255,0,0,0); } }
      `}</style>
    </div>
  );
};

const btnGreen   = { padding: "18px 40px", fontSize: "1.4rem", background: "#4CAF50", color: "white", border: "none", borderRadius: "50px", cursor: "pointer" };
const btnRed     = { ...btnGreen, background: "#f44336" };
const btnOrange  = { ...btnGreen, background: "#FF9800" };
const btnGray    = { ...btnGreen, background: "#666", fontSize: "1.2rem" };
const btnBack    = { padding: "12px 30px", background: "#333", color: "white", border: "none", borderRadius: "50px", marginTop: "20px" };

export default VideoRecordPage;
