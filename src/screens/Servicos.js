import React, { useState } from "react";
import QRCode from "qrcode.react"; // ← biblioteca leve que gera QR no navegador

const Servicos = () => {
  const [copiaECola, setCopiaECola] = useState("");
  const [loading, setLoading] = useState(false);

  const pagar = async (valor, tipo) => {
    setLoading(true);
    setCopiaECola("");

    try {
      const res = await fetch("/.netlify/functions/criar-pix-asaas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ valor, tipo })
      });

      const data = await res.json();
      console.log("Asaas devolveu:", data);

      if (data.success && data.copiaECola) {
        setCopiaECola(data.copiaECola);
      } else {
        alert("Erro: " + JSON.stringify(data));
      }
    } catch (e) {
      alert("Erro: " + e.message);
    } finally {
      setLoading(false);
    }
  };

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

      {loading && <p>Gerando Pix...</p>}

      {copiaECola && (
        <div style={{ marginTop: "30px" }}>
          <h3>Pague com Pix</h3>
          
          {/* GERA O QR CODE NO NAVEGADOR COM O CÓDIGO COPIA-E-COLA */}
          <QRCode value={copiaECola} size={280} level="H" />

          <p style={{ marginTop: "20px" }}>Ou copie o código:</p>
          <textarea
            readOnly
            value={copiaECola}
            onClick={(e) => e.target.select()}
            style={{ width: "100%", height: "100px", fontFamily: "monospace" }}
          />
        </div>
      )}
    </div>
  );
};

export default Servicos;
