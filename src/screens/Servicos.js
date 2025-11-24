import React, { useState } from "react";

const Servicos = () => {
  const [qrCode, setQrCode] = useState(null);
  const [copiaECola, setCopiaECola] = useState(null);
  const [loading, setLoading] = useState(false);

  const pagar = async (valor, tipo) => {
    setLoading(true);
    setQrCode(null);
    setCopiaECola(null);

    try {
      const res = await fetch("/.netlify/functions/criar-pix-asaas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          valor,
          tipo,
          userId: "TESTE_USER_123" // use um ID de teste, qualquer string
        }),
      });

      const data = await res.json();

      if (data.success) {
        setQrCode(data.qrCodeUrl);
        setCopiaECola(data.copiaECola);
      } else {
        alert("Erro: " + JSON.stringify(data));
      }
    } catch (e) {
      alert("Erro de rede: " + e.message);
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
      <img
        src="/coruja-rosa.gif"
        alt="coruja"
        style={{ width: "180px", marginBottom: "20px" }}
      />

      <h2>Escolha seu serviço</h2>

      <div style={{ marginTop: "20px", display: "flex", flexDirection: "column", gap: "15px" }}>
        <button onClick={() => pagar(5.0, "áudio")} disabled={loading}>
          ÁUDIO — R$ 5,00
        </button>

        <button onClick={() => pagar(8.0, "vídeo")} disabled={loading}>
          VÍDEO — R$ 8,00
        </button>
      </div>

      {loading && <p style={{ marginTop: "20px" }}>Gerando PIX...</p>}

      {qrCode && (
        <div style={{ marginTop: "30px" }}>
          <h3>Escaneie o QR Code:</h3>
          <img src={qrCode} alt="PIX QR Code" style={{ maxWidth: "100%" }} />
          <p>
            Ou copie e cole:
            <br />
            <code style={{ wordBreak: "break-all" }}>{copiaECola}</code>
          </p>
        </div>
      )}
    </div>
  );
};

export default Servicos;
