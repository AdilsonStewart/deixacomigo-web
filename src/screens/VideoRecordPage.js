import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const VideoRecordPage = () => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const recorderRef = useRef(null);
  const chunks = useRef([]);

  const [recording, setRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [seconds, setSeconds] = useState(30);
  const [gravacaoId] = useState(() => `VID-${Date.now()}-${Math.floor(Math.random() * 10000)}`);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(s => {
        streamRef.current = s;
        if (videoRef.current) videoRef.current.srcObject = s;
      })
      .catch(() => alert('Permita câmera e microfone!'));
  }, []);

  const start = () => {
    chunks.current = [];
    const r = new MediaRecorder(streamRef.current);
    recorderRef.current = r;
    r.ondataavailable = e => e.data.size > 0 && chunks.current.push(e.data);
    r.onstop = () => {
      const blob = new Blob(chunks.current, { type: 'video/webm' });
      setRecordedBlob(blob);
      setRecording(false);
      setSeconds(30);
      streamRef.current.getTracks().forEach(t => t.stop());
      if (videoRef.current) videoRef.current.srcObject = null;
    };
    r.start();
    setRecording(true);
    setSeconds(30);
  };

  const stop = () => recorderRef.current?.stop();

  const regravar = () => {
    setRecordedBlob(null);
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(s => {
        streamRef.current = s;
        if (videoRef.current) videoRef.current.srcObject = s;
      });
  };

  // ←←← A FUNÇÃO QUE SOBE O VÍDEO DE VERDADE
  const salvar = async () => {
    if (!recordedBlob) return;

    const filename = `video_${gravacaoId}.webm`;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result;

      try {
        const response = await fetch('/.netlify/functions/upload-video', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ videoBase64: base64, filename })
        });

        const data = await response.json();

        if (data.url) {
          localStorage.setItem('lastRecordingUrl', data.url);
          alert('Vídeo enviado com sucesso! Já pode agendar');
          navigate('/agendamento');
        } else {
          alert('Erro ao enviar: ' + (data.error || 'Tenta novamente'));
        }
      } catch (err) {
        console.error(err);
        alert('Erro de conexão. Tenta novamente.');
      }
    };
    reader.readAsDataURL(recordedBlob);
  };

  useEffect(() => {
    if (recording && seconds > 0) {
      const t = setTimeout(() => setSeconds(s => s - 1), 1000);
      return () => clearTimeout(t);
    } else if (seconds === 0 && recording) stop();
  }, [recording, seconds]);

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#667eea,#764ba2)', color: 'white', textAlign: 'center', padding: '20px' }}>
      <h1 style={{ fontSize: '2.8rem' }}>Gravar Vídeo Surpresa</h1>
      <h2>ID: {gravacaoId}</h2>

      <video ref={videoRef} autoPlay muted playsInline style={{ width: '90%', maxWidth: '800px', borderRadius: '20px', background: '#000' }} />

      {recordedBlob && (
        <video src={URL.createObjectURL(recordedBlob)} controls autoPlay loop style={{ width: '90%', maxWidth: '800px', marginTop: '20px', borderRadius: '20px' }} />
      )}

      {recording && <div style={{ fontSize: '3rem', margin: '30px' }}>Gravando... {seconds}s</div>}

      <div style={{ margin: '40px' }}>
        {!recording && !recordedBlob && (
          <button onClick={start} style={btnGreen}>Iniciar Gravação</button>
        )}
        {recording && (
          <button onClick={stop} style={btnRed}>Parar</button>
        )}
        {recordedBlob && (
          <>
            <button onClick={salvar} style={btnOrange}>Salvar e Agendar</button>
            <button onClick={regravar} style={btnGray}>Regravar</button>
          </>
        )}
      </div>
    </div>
  );
};

const btnGreen  = { padding: '20px 60px', fontSize: '1.8rem', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '50px', margin: '10px' };
const btnRed    = { ...btnGreen, background: '#f44336' };
const btnOrange = { ...btnGreen, background: '#FF9800' };
const btnGray   = { ...btnGreen, background: '#666' };

export default VideoRecordPage;
