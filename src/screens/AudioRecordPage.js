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
      alert("Erro ao salvar o áudio.");
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
  const playAudio = () => audioURL && new Audio(audioURL).play();

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        color: "white",
        fontFamily: "'Segoe UI', sans-serif",
      }}
    >
      {/* CORUJINHA ORIGINAL */}
      <img
        src="https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExdjJvb3Zudjg1c2lnNHptdHI5aHQ1amduMXI4OHM1OG4wZHJ0OXVzeiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/F6Vj7mncrFOYmgVHKb/giphy.gif"
        alt="Corujinha dançando"
        style={{ width: "180px", marginBottom: "20px" }}
      />

      <h1 style={{ fontSize: "2.5rem", margin: "0 0 20px 0" }}>Gravar Áudio</h1>

      <div style={{ fontSize: "3rem", fontWeight: "bold", marginBottom: "20px" }}>
        {formatTime(time)}
      </div>

      {recording && (
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <p style={{ margin: "0 0 10px 0" }}>Tempo máximo: 30 segundos</p>
          <div style={{ width: "280px", height: "12px", background: "rgba(255,255,255,0.3)", borderRadius: "6px", overflow: "hidden" }}>
            <div
              style={{
                height: "100%",
                width: `${(time / 30) * 100}%`,
                background: "#fff",
                transition: "width 0.4s ease",
              }}
            />
          </div>
        </div>
      )}

      {/* GRAVANDO */}
      {!audioURL && !saving && (
        <div style={{ textAlign: "center" }}>
          {!recording ? (
            <button
              onClick={startRecording}
              style={{
                padding: "18px 40px",
                fontSize: "1.4rem",
                background: "#4CAF50",
                color: "white",
                border: "none",
                borderRadius: "50px",
                cursor: "pointer",
                boxShadow: "0 8px 15px rgba(0,0,0,0.3)",
              }}
            >
              Iniciar Gravação
            </button>
          ) : (
            <div style={{ position: "relative", display: "inline-block" }}>
              <div
                style={{
                  position: "absolute",
                  inset: "-20px",
                  border: "4px solid rgba(255,255,255,0.4)",
                  borderRadius: "50%",
                  animation: "pulse 1.5s infinite",
                }}
              />
              <button
                onClick={stopRecording}
                style={{
                  padding: "18px 40px",
                  fontSize: "1.4rem",
                  background: "#f44336",
                  color: "white",
                  border: "none",
                  borderRadius: "50px",
                  cursor: "pointer",
                  position: "relative",
                  zIndex: 1,
                }}
              >
                Parar Gravação
              </button>
            </div>
          )}
        </div>
      )}

      {/* REPRODUZIR */}
      {audioURL && !saving && (
        <div style={{ textAlign: "center", margin: "30px 0" }}>
          <button
            onClick={playAudio}
            style={{
              padding: "14px 30px",
              fontSize: "1.2rem",
              background: "#2196F3",
              color: "white",
              border: "none",
              borderRadius: "50px",
              cursor: "pointer",
            }}
          >
            Ouvir Gravação
          </button>
          <p style={{ margin: "20px 0 0 0", fontSize: "1.3rem" }}>
            Áudio salvo com sucesso!
          </p>
        </div>
      )}

      {/* SALVANDO */}
      {saving && (
        <p style={{ fontSize: "1.4rem", margin: "30px 0" }}>
          Guardando seu áudio...
        </p>
      )}

      {/* AGENDAR */}
      {audioURL && !saving && (
        <button
          onClick={() => navigate("/agendamento")}
          style={{
            marginTop: "40px",
            padding: "18px 50px",
            fontSize: "1.5rem",
            background: "#FF9800",
            color: "white",
            border: "none",
            borderRadius: "50px",
            cursor: "pointer",
            boxShadow: "0 8px 20px rgba(0,0,0,0.3)",
          }}
        >
          Ir para Agendamento
        </button>
      )}

      <style jsx>{`
        @keyframes pulse {
          0% { transform: scale(0.8); opacity: 0.7; }
          70% { transform: scale(1.1); opacity: 0.3; }
          100% { transform: scale(1.3); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default AudioRecordPage;
