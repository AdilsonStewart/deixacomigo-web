// src/components/PixPayment.js
import React, { useState } from "react";

export default function PixPayment() {
  const [valor, setValor] = useState(5.00); // valor padrão
  const [loading, setLoading] = useState(false);
  const [qrCode, setQrCode] = useState(null);
  const [pixPayload, setPixPayload] = useState("");
  const [error, setError] = useState("");

  const gerarPix = async () => {
    setLoading(true);
    setError("");
    setQrCode(null);
    setPixPayload("");

    try {
      const res = await fetch("/.netlify/functions/criar-pagamento-asaas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ valor }),
      });
      const data = await res.json();

      if (data.success) {
        setQrCode(data.qrCodeBase64);
        setPixPayload(data.copiaECola);
      } else {
        setError(data.error || "Erro desconhecido ao gerar PIX");
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  };

  const copiarPix = () => {
    navigator.clipboard.writeText(pixPayload);
    alert("Código PIX copiado!");
  };

  return (
    <div style={{ textAlign: "center", padding: "20px", maxWidth: "400px", margin: "auto" }}>
      <h2>Pagamento PIX</h2>

      <p>Escolha o valor:</p>
      <select
        value={valor}
        onChange={(e) => setValor(Number(e.target.value))}
        style={{ padding: "10px", marginBottom: "20px", cursor: "pointer" }}
      >
        <option value={5.00}>R$ 5,00</option>
        <option value={8.00}>R$ 8,00</option>
      </select>

      {!qrCode && !loading && (
        <button onClick={gerarPix} style={{ padding: "10px 20px", cursor: "pointer" }}>
          Gerar QR Code PIX
        </button>
      )}

      {loading && <p>Gerando PIX...</p>}

      {error && <p style={{ color: "red" }}>{error}</p>}

      {qrCode && (
        <>
          <img
            src={`data:image/png;base64,${qrCode}`}
            alt="PIX QR Code"
            style={{ margin: "20px 0", maxWidth: "100%" }}
          />
          <div>
            <button onClick={copiarPix} style={{ padding: "10px 20px", cursor: "pointer" }}>
              Copiar código PIX
            </button>
          </div>
          <p style={{ wordBreak: "break-all", marginTop: "10px" }}>{pixPayload}</p>
        </>
      )}
    </div>
  );
}
