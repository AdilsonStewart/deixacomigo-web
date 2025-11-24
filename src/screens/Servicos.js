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
        body: JSON.stringify({ valor, tipo })
      });

      const data = await res.json();

      if (data.success) {
        setQrCode(data.qrCodeUrl);
        setCopiaECola(data.copiaECola);
      } else {
        alert("Erro: " + (data.erro || JSON.stringify(data)));
      }
    } catch (e) {
      alert("Erro de rede: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto", textAlign: "center" }}>
      <h2>Escolha seu serviço</h2>

      <button onClick={() => pagar(5.0, "áudio")} disabled={loading}>
        ÁUDIO — R$ 5,00
      </button>

      <button onClick={() => pagar(8.0, "vídeo")} disabled={loading} style={{ marginLeft: "10px" }}>
        VÍDEO — R$ 8,00
      </button>

      {loading && <p style={{ marginTop: "30px" }}>Gerando PIX...</p>}

      {qrCode && (
        <div style={{ marginTop: "30px" }}>
          <h3>Escaneie o QR Code:</h3>
          <img src={qrCode} alt="PIX" style={{ maxWidth: "100%" }} />
          <p>
            Ou copie:
            <br />
            <code style={{ wordBreak: "break-all", background: "#f0f0f0", padding: "10px" }}>
              {copiaECola}
            </code>
          </p>
        </div>
      )}
    </div>
  );
};

export default Servicos;
