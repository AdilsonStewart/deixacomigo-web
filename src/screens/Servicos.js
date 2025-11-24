import React, { useState } from "react";

const Servicos = () => {
  const [qrCode, setQrCode] = useState(null);
  const [copiaECola, setCopiaECola] = useState(null);
  const [loading, setLoading] = useState(false);

  const pagar = async (valor, tipo) => {
    console.log("Botão clicado →", valor, tipo);

    setLoading(true);
    setQrCode(null);
    setCopiaECola(null);

    try {
      const res = await fetch("/.netlify/functions/criar-pix-asaas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ valor, tipo })
      });

      const data = await res.json();
      console.log("Resposta do Asaas:", data);

      if (data.success && data.qrCodeUrl && data.copiaECola) {
        setQrCode(data.qrCodeUrl);
        setCopiaECola(data.copiaECola);
      } else {
        alert("Erro do Asaas: " + JSON.stringify(data));
      }
    } catch (e) {
      console.error("Erro:", e);
      alert("Erro de conexão: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      maxWidth: "400px",
      margin: "50px auto",
      textAlign: "center",
      padding: "20px",
      border: "1px solid #ddd",
      borderRadius: "10px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
    }}>
      <img src="/coruja-rosa.gif" alt="coruja" style={{ width: "180px", marginBottom: "20px" }} />

      <h2>Escolha seu serviço</h2>

      <div style={{ marginTop: "20px", display: "flex", flexDirection: "column", gap: "15px" }}>
        <button onClick={() => pagar(5.0, "áudio")} disabled={loading}>
          ÁUDIO — R$ 5,00
        </button>

        <button onClick={() => pagar(8.0, "vídeo")} disabled={loading}>
          VÍDEO — R$ 8,00
        </button>
      </div>

      {loading && <p style={{ marginTop: "20px", fontWeight: "bold", color: "#0066cc" }}>Gerando PIX...</p>}

      {qrCode && (
        <div style={{ marginTop: "30px" }}>
          <h3>Pague com Pix</h3>
          <img src={qrCode} alt="QR Code" style={{ maxWidth: "280px", borderRadius: "10px" }} />
          <p style={{ marginTop: "15px" }}>Ou copie o código:</p>
          <textarea
            readOnly
            value={copiaECola}
            onClick={(e) => e.target.select()}
            style={{
              width: "100%",
              height: "80px",
              padding: "10px",
              fontFamily: "monospace",
              background: "#f8f8f8",
              borderRadius: "8px"
            }}
          />
          <small>(clique no campo para copiar)</small>
        </div>
      )}
    </div>
  );
};

export default Servicos;
