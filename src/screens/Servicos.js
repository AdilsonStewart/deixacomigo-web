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
      console.log("Tudo que veio do Asaas:", data);

      // Asaas manda de jeitos diferentes, então aceita tudo
      const imagem = data.encodedImage
        ? `data:image/png;base64,${data.encodedImage}`
        : data.qrCodeUrl || data.qrCode || "";

      const texto = data.payload || "não veio código";

      setQrCode(imagem);
      setCopiaECola(texto);

    } catch (e) {
      alert("Erro: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  // resto do return igual (botões e tudo)
  return (
    <div style={{ maxWidth: "400px", margin: "50px auto", textAlign: "center" }}>
      <img src="/coruja-rosa.gif" alt="coruja" style={{ width: "180px" }} />
      <h2>Escolha seu serviço</h2>

      <button onClick={() => pagar(5.0, "áudio")} disabled={loading}>
        ÁUDIO — R$ 5,00
      </button>
      <br /><br />
      <button onClick={() => pagar(8.0, "vídeo")} disabled={loading}>
        VÍDEO — R$ 8,00
      </button>

      {loading && <p>Gerando PIX...</p>}

      {qrCode && (
        <div style={{ marginTop: "30px" }}>
          <img src={qrCode} alt="QR Code" style={{ maxWidth: "280px" }} />
          <p>Copie o código:</p>
          <textarea readOnly value={copiaECola} style={{ width: "100%", height: "80px" }} onClick={e => e.target.select()} />
        </div>
      )}
    </div>
  );
};

export default Servicos;
