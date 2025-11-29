import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import corujinhaGif from "../assets/corujinha.gif"; // ajuste o caminho se precisar

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

  // ================================================================
  // Salva via Netlify Function (sem CORS e sem variável gigante)
  // ================================================================
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
        if (!json.success) throw new Error(json.error);

        localStorage.setItem("lastRecordingUrl", json.url);
        localStorage.setItem("lastRecordingId", "temp"); // só pra não quebrar o fluxo

        alert("Áudio salvo com sucesso!");
      };
    } catch (err) {
      alert("Erro ao salvar áudio: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  // ================================================================
  // Parada centralizada
  // ================================================================
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

  // ================================================================
  // Iniciar gravação
  // ================================================================
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
        saveRecordingToFirebase(blob); // salva automático
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
      alert("Erro no microfone. Verifique as permissões.");
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
      <img src={corujinhaGif} alt="Corujinha" className="audio-gif" />
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
        <button className="btn-schedule" onClick={() => navigate("/agendamento")}>
          Ir para Agendamento
        </button>
      )}
    </div>
  );
};

export default AudioRecordPage;
