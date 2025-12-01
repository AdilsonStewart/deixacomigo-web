// src/screens/VideoRecordPage.js → VERSÃO QUE FUNCIONA 100% COM CORS BLOQUEADO
import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const VideoRecordPage = () => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const [recording, setRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const streamRef = useRef(null);
  const [gravacaoId] = useState(() => `video_${Date.now()}`);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      alert('Permita câmera e microfone!');
    }
  };

  const startRecording = () => {
    if (!streamRef.current) return;
    const chunks = [];
    const recorder = new MediaRecorder(streamRef.current);
    mediaRecorderRef.current = recorder;

    recorder.ondataavailable = e => chunks.push(e.data);
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      setRecordedBlob(blob);
      setRecording(false);
      uploadViaGoogle(blob);
    };

    recorder.start();
    setRecording(true);
    setSeconds(30);
  };

  const stopRecording = () => mediaRecorderRef.current?.stop();

  const uploadViaGoogle = async (blob) => {
    setUploading(true);
    const filename = `videos/${gravacaoId}.webm`;
    const url = `https://storage.googleapis.com/upload/storage/v1/b/deixacomigo-727ff.appspot.com/o?uploadType=media&name=${filename}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'video/webm',
        },
        body: blob
      });

      if (response.ok) {
        const data = await response.json();
        const downloadUrl = `https://storage.googleapis.com/deixacomigo-727ff.appspot.com/${filename}`;
        localStorage.setItem('lastRecordingUrl', downloadUrl);
        alert('Vídeo salvo com sucesso!');
        navigate('/agendamento');
      } else {
        alert('Erro no upload. Tenta de novo.');
      }
    } catch (e) {
      alert('Erro: ' + e.message);
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    startCamera();
    return () => streamRef.current?.getTracks().forEach(t => t.stop());
  }, []);

  useEffect(() => {
    if (recording && seconds > 0) {
      const t = setTimeout(() => setSeconds(s => s - 1), 1000);
      return () => clearTimeout(t);
    } else if (seconds === 0 && recording) {
      stopRecording();
    }
  }, [recording, seconds]);

  return (
    <div style={{ textAlign: 'center', padding: '20px', background: '#667eea', minHeight: '100vh', color: 'white' }}>
      <h1>Gravar Vídeo Surpresa</h1>
      <h3>ID: {gravacaoId}</h3>

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
          style={{ width: '90%', maxWidth: '800px', marginTop: '20px', borderRadius: '20px' }}
        />
      )}

      <div style={{ margin: '30px' }}>
        {!recording && !recordedBlob && (
          <button onClick={startRecording} style={{ padding: '20px 50px', fontSize: '1.6rem', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '50px' }}>
            Iniciar Gravação
          </button>
        )}
        {recording && (
          <>
            <p style={{ fontSize: '2.5rem', margin: '20px' }}>Gravando… {seconds}s</p>
            <button onClick={stopRecording} style={{ padding: '20px 50px', fontSize: '1.6rem', background: '#f44336', color: 'white', border: 'none', borderRadius: '50px' }}>
              Parar
            </button>
          </>
        )}
        {uploading && <p style={{ fontSize: '2rem' }}>Enviando vídeo...</p>}
      </div>
    </div>
  );
};

export default VideoRecordPage;
