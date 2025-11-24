import React, { useState } from "react";
import { getAuth } from "firebase/auth";

const Servicos = () => {
  const [qrCode, setQrCode] = useState(null);
  const [copiaECola, setCopiaECola] = useState(null);
  const [loading, setLoading] = useState(false);

  const pagar = async (valor, tipo) => {
    setLoading(true);
    setQrCode(null);
    setCopiaECola(null);

    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        alert("Erro: usuário não identificado. Volte ao cadastro.");
        setLoading(false);
        return;
      }

      // envia o UID do usuário para a função serverless
      const res = await fetch("/.netlify/functions/criar-pix-asaas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          valor,
          tipo,
          userId: user.uid
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
        <button
          onClick={() => pagar(5.0, "áudio")}
          style={{
            padding: "20px 40px",
            fontSize: "1.5rem",
            background: "#ff4dd2",
            color: "white",
            border: "none",
            borderRadius: "10px",
            marginRight: "20px",
          }}
          disabled={loading}
        >
          ÁUDIO — R$ 5,00
        </button>

        <button
          onClick={() => pagar(8.0, "vídeo")}
          style={{
            padding: "20px 40px",
            fontSize: "1.5rem",
            background: "#ff69b4",
            color: "white",
            border: "none",
            borderRadius: "10px",
          }}
          disabled={loading}
        >
          VÍDEO — R$ 8,00
        </button>
      </div>

      {loading && <p style={{ marginTop: "20px" }}>Gerando PIX...</p>}

      {qrCode && (
        <div style={{ marginTop: "30px" }}>
          <h3>Escaneie o QR Code com seu app de pagamentos:</h3>
          <img src={qrCode} alt="PIX QR Code" style={{ marginTop: "10px" }} />
          <p style={{ marginTop: "10px" }}>
            Ou copie e cole este código:
            <br />
            <code>{copiaECola}</code>
          </p>
        </div>
      )}
    </div>
  );
};

export default Servicos;
