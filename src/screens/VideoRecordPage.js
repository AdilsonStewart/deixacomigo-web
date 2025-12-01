import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const VideoRecordPage = () => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunks = useRef([]);

  const [recording, setRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [seconds, setSeconds] = useState(30);
  const [uploading, setUploading] = useState(false);
  const [gravacaoId] = useState(() => `VID-${Date.now()}-${Math.floor(Math.random()*10000)}`);

  // Inicia câmera
  useEffect(() => {
    const start = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch {
        alert('Permita câmera e microfone!');
      }
    };
    start();
    return () => streamRef.current?.getTracks().forEach(t => t.stop());
  }, []);

  const startRecording = () => {
    if (!streamRef.current) return;
    chunks.current = [];
    const recorder = new MediaRecorder(streamRef.current);
    mediaRecorderRef.current = recorder;

    recorder.ondataavailable = e => {
      if (e.data.size > 0) chunks.current.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunks.current, { type: 'video/webm' });
      setRecordedBlob(blob);
      setRecording(false);
      setSeconds(30);
      // Fecha câmera
      streamRef.current?.getTracks().forEach(t => t.stop());
      if (videoRef.current) videoRef.current.srcObject = null;
    };

    recorder.start();
    setRecording(true);
    setSeconds(30);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
  };

  const regravar = () => {
    setRecordedBlob(null);
    const startCam = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
    };
    startCam();
  };

  const salvarEIr = async () => {
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
          body: JSON.stringify({ videoBase64: base64, gravacaoId })
        });

        const { url } = await res.json();

        if (url) {
          localStorage.setItem('lastRecordingUrl', url);
          alert('Vídeo salvo com sucesso!');
          navigate('/agendamento');
        } else {
          alert('Erro ao salvar vídeo');
        }
      };
      };
    } catch {
      alert('Erro de conexão');
    } finally {
      setUploading(false);
    };
  };

  // Timer
  useEffect(() => {
    if (recording && seconds > 0) {
      const t = setTimeout(() => setSeconds(s => s-1), 1000);
      return () => clearTimeout(t);
    } else if (seconds === 0 && recording) {
      stopRecording();
    }
  }, [recording, seconds]);

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#667eea,#764ba2)', color: 'white', padding: '20px', textAlign: 'center' }}>
      <h1 style={{ fontSize: '2.8rem' }}>Gravar Vídeo Surpresa</h1>
      <h2>ID: {gravacaoId}</h2>

      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        style={{ width: '90%', maxWidth: '800px', borderRadius: '20px', background: '#000' }}
      />

      {recordedBlob && (
        <video
          src={URL.createObjectURL(recordedBlob)}
          controls
          autoPlay
          loop
          style={{ width: '90%', maxWidth: '800px', borderRadius: '20px', marginTop: '20px' }}
        />
      )}

      {recording && (
        <div style={{ fontSize: '3rem', margin: '30px' }}>Gravando... {seconds}s</div>
      )}

      <div style={{ margin: '40px' }}>
        {!recording && !recordedBlob && (
          <button onClick={startRecording} style={{ padding: '20px 60px', fontSize: '1.8rem', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '50px' }}>
            Iniciar Gravação
          </button>
        )}

        {recording && (
          <button onClick={stopRecording} style={{ padding: '20px 60px', background: '#f44336', fontSize: '1.8rem' }}>
            Parar
          </button>
        )}

        {recordedBlob && !uploading && (
          <>
            <button onClick={salvarEIr} style={{ padding: '20px 60px', background: '#FF9800' }}>
              Salvar e Agendar
            </button>
            <button onClick={regravar} style={{ padding: '20px 60px', background: '#666' }}>
              Regravar
            </button>
          </>
        )}

        {uploading && <p style={{ fontSize: '2.5rem' }}>Enviando vídeo...</p> }

      </div>

      <button onClick={() => navigate(-1)} style={{ padding: '15px 40px', background: '#333', color: 'white', border: 'none', borderRadius: '50px' }}>
        Voltar
      </button>
    </div>
  );
};

export default VideoRecordPage;
