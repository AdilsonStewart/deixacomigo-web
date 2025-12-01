// src/screens/VideoRecordPage.js
import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const VideoRecordPage = () => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const liveVideoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);

  const [recording, setRecording] = useState(false);
  const [recordedUrl, setRecordedUrl] = useState('');
  const [seconds, setSeconds] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [gravacaoId, setGravacaoId] = useState('');

  // Gera ID único
  const generateId = () => `VID-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

  // Inicia câmera
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
      alert('Erro ao acessar câmera/mic. Permita o acesso!');
    }
  };

  // INÍCIO DA GRAVAÇÃO (FORÇA MP4!)
  const startRecording = async () => {
    if (!streamRef.current) return;

    chunksRef.current = [];

    const options = { mimeType: 'video/mp4' };
    // Se MP4 não for suportado, tenta WebM com opus
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
      localStorage.setItem('lastRecordingUrl', url); // já salva pra agendamento
      localStorage.setItem('lastVideoBlob', url);   // backup
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

  // Contador
  useEffect(() => {
    if (recording && seconds > 0) {
      const timer = setTimeout(() => setSeconds(seconds - 1), 1000);
      return () => clearTimeout(timer);
    } else if (seconds === 0 && recording) {
      stopRecording();
    }
  }, [recording, seconds]);

  // Upload via Netlify Function (sem CORS!)
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
        alert('Vídeo salvo com sucesso! Indo para agendamento...');
        setTimeout(() => navigate('/agendamento'), 1000);
      } else {
        alert('Erro ao salvar vídeo: ' + json.error);
      }
    } catch (err) {
      alert('Erro de conexão ao salvar vídeo.');
    } finally {
      setUploading(false);
    }
  };

  const regravar = () => {
    setRecordedUrl('');
    setGravacaoId('');
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
          <p>{seconds}s restantes</p>
        </div>
      )}

      <div style={{ margin: "20px auto", maxWidth: "800px", background: "#000", borderRadius: "15px", overflow: "hidden" }}>
        {recordedUrl ? (
          <video controls src={recordedUrl} style={{ width: "100%", maxHeight: "70vh" }} />
        ) : (
          <video ref={liveVideoRef} autoPlay muted playsInline style={{ width: "100%", maxHeight: "70vh" }} />
        )}
      </div>

      <div style={{ margin: "30px 0" }}>
        {!recordedUrl && !recording && (
          <button onClick={startRecording} style={{
            padding: "18px 40px", fontSize: "1.4rem", background: "#4CAF50", color: "white",
            border: "none", borderRadius: "50px", cursor: "pointer"
          }}>
            Iniciar Gravação (30s)
          </button>
        )}

        {recording && (
          <button onClick={stopRecording} style={{
            padding: "18px 40px", fontSize: "1.4rem", background: "#f44336", color: "white",
            border: "none", borderRadius: "50px", cursor: "pointer"
          }}>
            Parar Gravação
          </button>
        )}

        {recordedUrl && !uploading && (
          <>
            <button onClick={uploadAndGo} style={{
              padding: "18px 40px", fontSize: "1.4rem", background: "#FF9800", color: "white",
              border: "none", borderRadius: "50px", cursor: "pointer", margin: "0 10px"
            }}>
              Salvar e Agendar
            </button>
            <button onClick={regravar} style={{
              padding: "18px 40px", fontSize: "1.2rem", background: "#666", color: "white",
              border: "none", borderRadius: "50px", cursor: "pointer"
            }}>
              Regravar
            </button>
          </>
        )}

        {uploading && <p style={{ fontSize: "1.5rem" }}>Enviando vídeo...</p>}
      </div>

      <button onClick={() => navigate(-1)} style={{
        padding: "12px 30px", background: "#333", color: "white", border: "none", borderRadius: "50px"
      }}>
        Voltar
      </button>

      <style jsx>{`
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(255,0,0,0.7); }
          70% { box-shadow: 0 0 0 20px rgba(255,0,0,0); }
          100% { box-shadow: 0 0 0 0 rgba(255,0,0,0); }
        }
      `}</style>
    </div>
  );
};

export default VideoRecordPage;
