// src/screens/VideoRecordPage.js → VERSÃO QUE FUNCIONAVA ANTES (upload direto)
import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase/firebase-client';

const VideoRecordPage = () => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const [recording, setRecording] = useState(false);
  const [recordedUrl, setRecordedUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const streamRef = useRef(null);

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
    const recorder = new MediaRecorder(streamRef.current);
    mediaRecorderRef.current = recorder;
    const chunks = [];

    recorder.ondataavailable = e => chunks.push(e.data);
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      setRecordedUrl(url);
      setRecording(false);
      uploadVideo(blob);
    };

    recorder.start();
    setRecording(true);
    setSeconds(30);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    streamRef.current?.getTracks().forEach(t => t.stop());
  };

  const uploadVideo = async (blob) => {
    setUploading(true);
    const fileName = `video_${Date.now()}.webm`;
    const storageRef = ref(storage, `videos/${fileName}`);
    const uploadTask = uploadBytesResumable(storageRef, blob);

    uploadTask.on('state_changed',
      null,
      (error) => alert('Erro ao subir: ' + error.message),
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((url) => {
          localStorage.setItem('lastRecordingUrl', url);
          alert('Vídeo salvo com sucesso!');
          navigate('/agendamento');
        });
      }
    );
  };

  useEffect(() => {
    startCamera();
    return () => streamRef.current?.getTracks().forEach(t => t.stop());
  }, []);

  useEffect(() => {
    if (recording && seconds > 0) {
      const timer = setTimeout(() => setSeconds(s => s - 1), 1000);
      return () => clearTimeout(timer);
    } else if (seconds === 0 && recording) {
      stopRecording();
    }
  }, [recording, seconds]);

  return (
    <div style={{ textAlign: 'center', padding: '20px', background: '#667eea', minHeight: '100vh', color: 'white' }}>
      <h1>Gravar Vídeo Surpresa</h1>

      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        style={{ width: '90%', maxWidth: '800px', borderRadius: '15px', background: '#000' }}
      />

      {recordedUrl && (
        <div style={{ marginTop: '20px' }}>
          <video src={recordedUrl} controls autoPlay loop style={{ width: '90%', maxWidth: '800px', borderRadius: '15px' }} />
        </div>
      )}

      <div style={{ margin: '30px' }}>
        {!recording && !recordedUrl && (
          <button onClick={startRecording} style={{ padding: '15px 40px', fontSize: '1.5rem', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '50px' }}>
            Iniciar Gravação
          </button>
        )}
        {recording && (
          <>
            <p style={{ fontSize: '2rem' }}>Gravando... {seconds}s</p>
            <button onClick={stopRecording} style={{ padding: '15px 40px', fontSize: '1.5rem', background: '#f44336', color: 'white', border: 'none', borderRadius: '50px' }}>
              Parar
            </button>
          </>
        )}
        {uploading && <p style={{ fontSize: '1.8rem' }}>Enviando vídeo...</p>}
      </div>

      <button onClick={() => navigate(-1)} style={{ padding: '12px 30px', background: '#333', color: 'white', border: 'none', borderRadius: '50px' }}>
        Voltar
      </button>
    </div>
  );
};

export default VideoRecordPage;
