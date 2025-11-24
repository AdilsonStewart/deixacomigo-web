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
      const res = await fetch("/api/criar-pix-asaas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          valor,
          tipo
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
    <div style={{ textAlign: "center", padding: "50px" }}>
      <img
        src="/coruja-rosa.gif"
        alt="coruja"
        style={{ width: "180px", marginBottom: "30px" }}
      />

      <h2>Escolha seu serviço</h2>

      <div style={{ marginTop: "30px" }}>
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
          <img src={qrCode} alt="PIX QR Code" />
          <p>
            Ou copie e cole:
            <br />
            <code>{copiaECola}</code>
          </p>
        </div>
      )}
    </div>
  );
};

export default Servicos;
