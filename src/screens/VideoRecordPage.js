// src/screens/VideoRecordPage.js
import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { storage, db } from '../firebase/firebase-client';
import './VideoRecorder.css';

const VideoRecordPage = () => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  
  const [recording, setRecording] = useState(false);
  const [recordedVideo, setRecordedVideo] = useState(null);
  const [seconds, setSeconds] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [gravacaoId, setGravacaoId] = useState(null);

  const generateGravacaoId = () => {
    return `GRV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 1280, height: 720 }, 
        audio: true 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Erro ao acessar câmera:', error);
      alert('Não foi possível acessar a câmera. Verifique as permissões.');
    }
  };

  const startRecording = async () => {
    if (!streamRef.current) return;

    try {
      const mediaRecorder = new MediaRecorder(streamRef.current);
      mediaRecorderRef.current = mediaRecorder;
      const chunks = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/mp4' });
        const videoUrl = URL.createObjectURL(blob);
        setRecordedVideo({ blob, url: videoUrl });
        setRecording(false);
        setSeconds(0);
      };

      setSeconds(30);
      setRecording(true);
      mediaRecorder.start(1000);

      setTimeout(() => {
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.stop();
        }
      }, 30000);

    } catch (error) {
      console.error('Erro ao iniciar gravação:', error);
      alert('Erro ao iniciar gravação.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  useEffect(() => {
    let interval = null;
    if (recording && seconds > 0) {
      interval = setInterval(() => {
        setSeconds(seconds => seconds - 1);
      }, 1000);
    } else if (seconds === 0 && recording) {
      stopRecording();
    }
    return () => clearInterval(interval);
  }, [recording, seconds]);

  const uploadVideo = async () => {
    if (!recordedVideo) return;

    setUploading(true);
    try {
      const gravacaoId = generateGravacaoId();
      setGravacaoId(gravacaoId);

      const videoRefStorage = ref(storage, `videos/${gravacaoId}.mp4`);
      await uploadBytes(videoRefStorage, recordedVideo.blob);
      const videoUrl = await getDownloadURL(videoRefStorage);

      const gravacaoData = {
        id: gravacaoId,
        videoUrl: videoUrl,
        duracao: (30 - seconds) + ' segundos',
        timestamp: serverTimestamp(),
        status: 'pendente',
        tipo: 'video'
      };

      await setDoc(doc(db, 'gravacoes', gravacaoId), gravacaoData);

      localStorage.setItem('lastRecordingUrl', videoUrl);

      alert('✅ Vídeo salvo com sucesso!');
      
      setTimeout(() => {
        navigate('/agendamento');
      }, 1500);

    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      alert('Erro ao salvar vídeo. Tente novamente.');
    } finally {
      setUploading(false);
    }
  };

  const newRecording = () => {
    setRecordedVideo(null);
    setGravacaoId(null);
    startCamera();
  };

  useEffect(() => {
    startCamera();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="video-container">
      <h1 className="video-title">🎥 Gravar Vídeo Surpresa</h1>
      
      {gravacaoId && (
        <div className="gravacao-id">
          <strong>ID da Gravação: {gravacaoId}</strong>
        </div>
      )}

      {recording && (
        <div className="recording-timer">
          <div className="timer-circle">
            <span>{seconds}s</span>
          </div>
          <p>⏺️ Gravando... ({30 - seconds}/30 segundos)</p>
        </div>
      )}

      <div className="video-preview">
        {recordedVideo ? (
          <video 
            controls 
            src={recordedVideo.url} 
            className="recorded-video"
          />
        ) : (
          <video 
            ref={videoRef} 
            autoPlay 
            muted 
            className="live-video"
          />
        )}
      </div>

      <div className="video-controls">
        {!recordedVideo && !recording && (
          <button className="btn-record" onClick={startRecording}>
            🎬 Iniciar Gravação (30s)
          </button>
        )}
        
        {recording && (
          <button className="btn-stop" onClick={stopRecording}>
            ⏹️ Parar Gravação
          </button>
        )}
        
        {recordedVideo && !uploading && (
          <>
            <button className="btn-upload" onClick={uploadVideo}>
              ✅ Salvar e Agendar
            </button>
            <button className="btn-retry" onClick={newRecording}>
              🔄 Regravar
            </button>
          </>
        )}
        
        <button className="btn-back" onClick={() => navigate('/')}>
          ↩️ Voltar
        </button>
      </div>

      <div className="video-instructions">
        <h3>📋 Instruções:</h3>
        <ol>
          <li>Clique em "Iniciar Gravação"</li>
          <li>Grave sua mensagem especial (máximo 30 segundos)</li>
          <li>Assista a prévia e clique em "Salvar Vídeo"</li>
          <li>Agende a entrega na próxima tela</li>
        </ol>
      </div>

      {uploading && (
        <div className="upload-status">
          <p>📤 Enviando vídeo para o servidor...</p>
          <div className="loading-spinner"></div>
        </div>
      )}
    </div>
  );
};

export default VideoRecordPage;
