import React, { useState, useRef, useEffect } from "react";

const AudioRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [dataEntrega, setDataEntrega] = useState("");
  const [horaEntrega, setHoraEntrega] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [tempoRestante, setTempoRestante] = useState(30);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const tempoIntervalRef = useRef(null);

  // Para quando a página carregar
  useEffect(() => {
    return () => {
      if (tempoIntervalRef.current) {
        clearInterval(tempoIntervalRef.current);
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      setAudioURL(null);
      setAudioBlob(null);
      setTempoRestante(30);

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        setAudioURL(URL.createObjectURL(blob));
        stream.getTracks().forEach((track) => track.stop());
        if (tempoIntervalRef.current) {
          clearInterval(tempoIntervalRef.current);
        }
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);

      // TEMPORIZADOR DE 30 SEGUNDOS
      tempoIntervalRef.current = setInterval(() => {
        setTempoRestante((prev) => {
          if (prev <= 1) {
            stopRecording();
            return 30;
          }
          return prev - 1;
        });
      }, 1000);

    } catch (error) {
      alert("Não consegui acessar o microfone. Verifique as permissões.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (tempoIntervalRef.current) {
        clearInterval(tempoIntervalRef.current);
      }
      setTempoRestante(30);
    }
  };

  const enviarDados = async () => {
    if (!audioBlob) {
      alert("Grave um áudio antes de enviar.");
      return;
    }

    setIsUploading(true);

    const reader = new FileReader();
    reader.readAsDataURL(audioBlob);

    reader.onloadend = async () => {
      const base64data = reader.result;

      try {
        // URL CORRIGIDA PARA FLY.IO - ajuste se necessário
        const response = await fetch("https://deixacomigo-backup.fly.dev/api/upload", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify({
            audioBase64: base64data,
            nome,
            telefone,
            dataEntrega,
            horaEntrega,
            clienteId: localStorage.getItem("clienteId") || "sem-cadastro",
          }),
        });

        if (!response.ok) {
          throw new Error(`Erro ${response.status}`);
        }

        const result = await response.json();

        if (result.success) {
          alert("✅ Áudio enviado com sucesso!\n\nLink: " + result.url);
          setAudioURL(null);
          setAudioBlob(null);
          setNome("");
          setTelefone("");
          setDataEntrega("");
          setHoraEntrega("");
          localStorage.setItem("lastRecordingUrl", result.url);
        } else {
          alert("❌ Erro do servidor: " + (result.error || "Tente novamente"));
        }
      } catch (err) {
        console.error("Erro completo:", err);
        alert("❌ Sem conexão com servidor Fly.io.\n1. Verifique se o app está online\n2. Confirme a URL no fly.toml\n3. Tente em 1 minuto");
      } finally {
        setIsUploading(false);
      }
    };
  };

  return (
    <div style={{ padding: 20, fontFamily: "Arial, sans-serif", maxWidth: "600px", margin: "0 auto" }}>
      <h2>🎤 Gravador de Áudio - Máx 30s</h2>

      {!isRecording ? (
        <button 
          onClick={startRecording} 
          style={{ 
            fontSize: "20px", 
            padding: "15px 30px",
            background: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "10px",
            cursor: "pointer"
          }}
        >
          🎙️ Iniciar Gravação
        </button>
      ) : (
        <div>
          <button 
            onClick={stopRecording} 
            style={{ 
              fontSize: "20px", 
              padding: "15px 30px",
              background: "#dc3545",
              color: "white",
              border: "none",
              borderRadius: "10px",
              cursor: "pointer",
              marginRight: "10px"
            }}
          >
            ⏹️ Parar ({tempoRestante}s)
          </button>
          <span style={{ 
            fontSize: "18px", 
            color: "#dc3545", 
            fontWeight: "bold",
            background: "#ffebee",
            padding: "10px 15px",
            borderRadius: "20px"
          }}>
            ⏱️ {tempoRestante}s restantes
          </span>
        </div>
      )}

      {audioURL && (
        <div style={{ marginTop: 30 }}>
          <p><strong>✅ Áudio gravado (pronto para enviar):</strong></p>
          <audio controls src={audioURL} style={{ width: "100%", marginBottom: "20px" }} />
        </div>
      )}

      <hr style={{ margin: "40px 0" }} />

      <div style={{ display: "grid", gap: "15px" }}>
        <input
          type="text"
          placeholder="👤 Nome do destinatário"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          style={{ padding: "12px", fontSize: "16px", borderRadius: "8px", border: "1px solid #ddd" }}
        />
        <input
          type="tel"
          placeholder="📱 Telefone com DDD (ex: 11999999999)"
          value={telefone}
          onChange={(e) => setTelefone(e.target.value)}
          style={{ padding: "12px", fontSize: "16px", borderRadius: "8px", border: "1px solid #ddd" }}
        />
        <input
          type="date"
          value={dataEntrega}
          onChange={(e) => setDataEntrega(e.target.value)}
          style={{ padding: "12px", fontSize: "16px", borderRadius: "8px", border: "1px solid #ddd" }}
        />
        <select
          value={horaEntrega}
          onChange={(e) => setHoraEntrega(e.target.value)}
          style={{ padding: "12px", fontSize: "16px", borderRadius: "8px", border: "1px solid #ddd" }}
        >
          <option value="">🕒 Escolha o horário</option>
          <option value="09:00">09:00</option>
          <option value="10:00">10:00</option>
          <option value="11:00">11:00</option>
          <option value="14:00">14:00</option>
          <option value="15:00">15:00</option>
          <option value="16:00">16:00</option>
          <option value="17:00">17:00</option>
        </select>
      </div>

      <button
        onClick={enviarDados}
        disabled={!audioBlob || isUploading}
        style={{
          marginTop: 30,
          padding: "18px 40px",
          fontSize: "20px",
          background: (!audioBlob || isUploading) ? "#6c757d" : "#28a745",
          color: "white",
          border: "none",
          borderRadius: "12px",
          cursor: (!audioBlob || isUploading) ? "not-allowed" : "pointer",
          width: "100%"
        }}
      >
        {isUploading ? "📤 Enviando... Aguarde" : "🚀 Enviar Pedido com Áudio"}
      </button>

      {isUploading && (
        <div style={{
          marginTop: "15px",
          padding: "10px",
          background: "#e3f2fd",
          borderRadius: "8px",
          textAlign: "center",
          fontWeight: "bold"
        }}>
          ⏳ Enviando para Fly.io... Não feche a página!
        </div>
      )}
    </div>
  );
};

export default AudioRecorder;
