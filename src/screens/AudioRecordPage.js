import React, { useState } from "react";

const AudioRecordPage = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  let mediaRecorder = null;
  let chunks = [];

  const start = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    chunks = [];

    mediaRecorder.ondataavailable = e => chunks.push(e.data);
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: "audio/webm" });
      const url = URL.createObjectURL(blob);
      setAudioURL(url);

      // ENVIA AUTOMÁTICO quando parar
      uploadAudio(blob);
    };

    mediaRecorder.start();
    setIsRecording(true);
  };

  const stop = () => {
    mediaRecorder?.stop();
    setIsRecording(false);
  };

  const uploadAudio = async (blob) => {
    setIsUploading(true);
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = async () => {
      const base64 = reader.result;

      const res = await fetch("/.netlify/functions/salvar-audio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ audioBase64: base64 }),
      });

      const json = await res.json();
      setIsUploading(false);

      if (json.success) {
        alert("ÁUDIO SALVO COM SUCESSO!\n\nLink: " + json.url);
      } else {
        alert("Deu ruim: " + json.error);
      }
    };
  };

  return (
    <div style={{ padding: 30, textAlign: "center", fontFamily: "Arial" }}>
      <h1>Gravar Áudio</h1>

      {!isRecording ? (
        <button onClick={start} style={{ padding: "15px 30px", fontSize: 18 }}>
          🎙️ COMEÇAR GRAVAÇÃO
        </button>
      ) : (
        <button onClick={stop} style={{ padding: "15px 30px", fontSize: 18, background: "red", color: "white" }}>
          ⏹️ PARAR
        </button>
      )}

      {audioURL && (
        <div style={{ marginTop: 30 }}>
          <audio controls src={audioURL} />
        </div>
      )}

      {isUploading && <p style={{ marginTop: 20 }}>Enviando áudio, aguarde…</p>}
    </div>
  );
};

export default AudioRecordPage;
