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
  // NOVA FUNÇÃO: salva via Netlify Function (sem CORS!)
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

        if (!json.success) throw new Error(json.error || "Erro no servidor");

        // Salva ID e URL pra usar no agendamento depois
        localStorage.setItem("lastRecordingId", json.docId);
        localStorage.setItem("lastRecordingUrl", json.url);

        alert("Áudio salvo com sucesso!");
        setSaving(false);
      };
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar áudio. Tente novamente.");
      setSaving(false);
    }
  };

  // ================================================================
  // Função centralizada de parada (evita duplicação)
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

        // Salva automaticamente quando parar
        saveRecordingToFirebase(blob);
      };

      mediaRecorder.start();
      setRecording(true);
      setAudioURL("");
      setTime(0);

      // Contador + parada automática aos 30s
      timerRef.current = setInterval(() => {
        setTime((prev) => {
          const novo = prev + 1;
          if (novo >= 30) stopRecordingCentral();
          return novo;
        });
      }, 1000);
    } catch (err) {
      alert("Erro ao acessar o microfone. Verifique as permissões.");
    }
  };

  // ================================================================
  // Parar manual
  // ================================================================
  const stopRecording = () => stopRecordingCentral();

  // ================================================================
  // Ouvir novamente
  // ================================================================
  const playAudio = () => {
    if (audioURL) new Audio(audioURL).play();
  };

  // ================================================================
  // Formatar tempo
  // ================================================================
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="audio-record-page">
      <img src={corujinhaGif} alt="Gravar áudio" className="audio-gif" />
      <h1 className="audio-title">Gravar Áudio</h1>

      <div className="timer">{formatTime(time)}</div>

      {recording && (
        <div className="time-limit">
          <p>Tempo máximo: 30 segundos</p>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${(time / 30) * 100}%` }}
            ></div>
          </div>
        </div>
      }

      {/* FASE 1 – GRAVANDO */}
      {!audioURL && !saving && (
        <div className="recording-phase">
          {!recording ? (
            <button className="btn-record" onClick={startRecording} disabled={saving}>
              Iniciar Gravação
            </button>
          ) : (
            <div className="recording-controls">
              <div className="pulse-ring"></div>
              <button className="btn-stop" onClick={stopRecording}>
                Parar Gravação
              </button>
            </div>
          )}
        </div>
      )}

      {/* FASE 2 – OUVIR */}
      {audioURL && !saving && (
        <div className="playback-phase">
          <button className="btn-play" onClick={playAudio}>
            Ouvir Gravação
          </button>
          <p className="info-status">Áudio salvo! Agora é só agendar</p>
        </div>
      )}

      {/* FASE 3 – SALVANDO */}
      {saving && (
        <div className="saving-phase">
          <p className="saving-status">Guardando seu áudio...</p>
        </div>
      )}

      {/* BOTÃO AGENDAR */}
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
