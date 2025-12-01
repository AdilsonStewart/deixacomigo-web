// src/screens/VideoRecordPage.js → VERSÃO FINAL COM FUNCTION (SEM CORS)
import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

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
    if (!streamRef.current) return alert('Câmera não iniciada');
    chunksRef.current = [];
    const recorder = new MediaRecorder(streamRef.current);
    mediaRecorderRef.current = recorder;

    recorder.ondataavailable = e => e.data.size > 0 && chunksRef.current.push(e.data);
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
  };

  const stopRecording = () => mediaRecorderRef.current?.stop();

  useEffect(() => {
    if (recording && seconds > 0) {
      const id = setTimeout(() => setSeconds(s => s - 1), 1000);
      return () => clearTimeout(id);
    } else if (seconds === 0 && recording) {
      stopRecording();
    }
  }, [recording, seconds]);

  const uploadAndGo = async () => {
    if (!recordedBlob) return;
    setUploading(true);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(recordedBlob);
      reader.onloadend = async () => {
        const base64 = reader.result;

        const res = await fetch('/.netlify/functions/salvar-video', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ videoBase64: base64, gravacaoId }),
        });

        const json = await res.json();

        if (json.success) {
          localStorage.setItem('lastRecordingUrl', json.url);
          alert('Vídeo salvo com sucesso!');
          setTimeout(() => navigate('/agendamento'), 1000);
        } else {
          alert('Erro: ' + json.error);
        }
      };
    } catch (e) {
      alert('Erro de conexão.');
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
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#667eea,#764ba2)", color: "white", padding: "20px", textAlign: "center" }}>
      <h1 style={{ fontSize: "2.5rem" }}>Gravar Vídeo Surpresa</h1>
      <h3>ID: {gravacaoId}</h3>

      {recording && <div style={{ fontSize: "2rem", margin: "20px" }}>Gravando… {seconds}s</div>}

      <div style={{ maxWidth: "800px", margin: "20px auto", background: "#000", borderRadius: "15px", overflow: "hidden" }}>
        {!recordedBlob ? (
          <video ref={liveVideoRef} autoPlay muted playsInline style={{ width: "100%" }} />
        ) : (
          <video
            controls
            src={URL.createObjectURL(recordedBlob)}
            style={{ width: "100%" }}
            autoPlay
            loop
            playsInline
          />
        )}
      </div>

      <div style={{ display: "flex", gap: "15px", justifyContent: "center", flexWrap: "wrap", margin: "30px 0" }}>
        {!recordedBlob && !recording && <button onClick={startRecording} style={btnGreen}>Iniciar Gravação</button>}
        {recording && <button onClick={stopRecording} style={btnRed}>Parar</button>}
        {recordedBlob && !uploading && (
          <>
            <button onClick={uploadAndGo} style={btnOrange}>Salvar e Agendar</button>
            <button onClick={regravar} style={btnGray}>Regravar</button>
          </>
        )}
        {uploading && <p style={{ fontSize: "1.5rem" }}>Enviando vídeo…</p>}
      </div>

      <button onClick={() => navigate(-1)} style={btnBack}>Voltar</button>
    </div>
  );
};

const btnGreen  = { padding: "18px 40px", fontSize: "1.4rem", background: "#4CAF50", color: "white", border: "none", borderRadius: "50px", cursor: "pointer" };
const btnRed    = { ...btnGreen, background: "#f44336" };
const btnOrange = { ...btnGreen, background: "#FF9800" };
const btnGray   = { ...btnGreen, background: "#666", fontSize: "1.2rem" };
const btnBack   = { padding: "12px 30px", background: "#333", color: "white", border: "none", borderRadius: "50px", marginTop: "20px" };

export default VideoRecordPage;
