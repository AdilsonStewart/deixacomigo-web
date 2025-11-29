import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

const AudioRecordPage = () => {
  const navigate = useNavigate();

  const [recording, setRecording] = useState(false);
  const [audioURL, setAudioURL] = useState("");
  const [time, setTime] = useState(0);
  const [saving, setSaving] = useState(false);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const alreadyStoppedRef = useRef(false);

  // Salva o áudio usando a Netlify Function (sem CORS)
  const saveRecordingToFirebase = async (audioBlob) => {
    setSaving(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64data = reader.result;

        const res = await fetch("/.netlify/functions/salvar-audio", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            audioBase64: base64data,
            tipo: "audio",
            duracao: time,
            clienteId: localStorage.getItem("clienteId") || "anônimo",
          }),
        });

        const json = await res.json();
        if (json.success) {
          localStorage.setItem("lastRecordingUrl", json.url);
          alert("Áudio salvo com sucesso!");
        } else {
          alert("Erro ao salvar: " + (json.error || "tente novamente"));
        }
        setSaving(false);
      };
    } catch (err) {
      alert("Erro de conexão ao salvar.");
      setSaving(false);
    }
  };

  const stopRecordingCentral = () => {
    if (alreadyStoppedRef.current) return;
    alreadyStoppedRef.current = true;

    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop());
    }
    setRecording(false);
    clearInterval(timerRef.current);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);

      mediaRecorderRef.current = mediaRecorder;
      alreadyStoppedRef.current = false;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setAudioURL(url);
        saveRecordingToFirebase(blob);
      };

      mediaRecorder.start();
      setRecording(true);
      setAudioURL("");
      setTime(0);

      timerRef.current = setInterval(() => {
        setTime((prev) => {
          const novo = prev + 1;
          if (novo >= 30) stopRecordingCentral();
          return novo;
        });
      }, 1000);
    } catch (err) {
      alert("Erro ao acessar o microfone.");
    }
  };

  const stopRecording = () => stopRecordingCentral();

  const playAudio = () => {
    if (audioURL) new Audio(audioURL).play();
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="audio-record-page">
      {/* CORUJINHA DO GIPHY EXATAMENTE A QUE VOCÊ USAVA */}
      <img
        src="https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExdjJvb3Zudjg1c2lnNHptdHI5aHQ1amduMXI4OHM1OG4wZHJ0OXVveiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/F6Vj7mncrFOYmgVHKb/giphy.gif"
        alt="Corujinha dançando"
        className="audio-gif"
      />

      <h1 className="audio-title">Gravar Áudio</h1>

      <div className="timer">{formatTime(time)}</div>

      {recording && (
        <div className="time-limit">
          <p>Tempo máximo: 30 segundos</p>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${(time / 30) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* GRAVANDO */}
      {!audioURL && !saving && (
        <div className="recording-phase">
          {!recording ? (
            <button className="btn-record" onClick={startRecording} disabled={saving}>
              Iniciar Gravação
            </button>
          ) : (
            <div className="recording-controls">
              <div className="pulse-ring" />
              <button className="btn-stop" onClick={stopRecording}>
                Parar Gravação
              </button>
            </div>
          )}
        </div>
      )}

      {/* OUVIR */}
      {audioURL && !saving && (
        <div className="playback-phase">
          <button className="btn-play" onClick={playAudio}>
            Ouvir Gravação
          </button>
          <p className="info-status">Áudio salvo! Pode agendar</p>
        </div>
      )}

      {/* SALVANDO */}
      {saving && (
        <div className="saving-phase">
          <p className="saving-status">Guardando seu áudio...</p>
        </div>
      )}

      {/* AGENDAR */}
      {audioURL && !saving && (
        <button
          className="btn-schedule"
          onClick={() => navigate("/agendamento")}
        >
          Ir para Agendamento
        </button>
      )}
    </div>
  );
};

export default AudioRecordPage;
