import React, { useState } from "react";

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
      
      if (data.success && data.copiaECola) {
        setCopiaECola(data.copiaECola);
        // COPIA AUTOMATICAMENTE para a área de transferência
        navigator.clipboard.writeText(data.copiaECola);
        alert("PIX copiado! Cole no seu app bancário.");
      } else {
        alert("Erro: " + data.erro);
      }
    } catch (e) {
      alert("Erro: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  // GERA QR CODE
  const qrUrl = copiaECola
    ? `https://chart.googleapis.com/chart?chs=300x300&cht=qr&chl=${encodeURIComponent(copiaECola)}`
    : "";

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto", textAlign: "center" }}>
      <img src="/coruja-rosa.gif" alt="coruja" style={{ width: "180px" }} />
      <h2>Escolha seu serviço</h2>

      <button onClick={() => pagar(5.0, "áudio")} disabled={loading}>
        {loading ? "GERANDO PIX..." : "ÁUDIO — R$ 5,00"}
      </button>
      <br /><br />
      <button onClick={() => pagar(8.0, "vídeo")} disabled={loading}>
        {loading ? "GERANDO PIX..." : "VÍDEO — R$ 8,00"}
      </button>

      {copiaECola && (
        <div style={{ marginTop: "30px" }}>
          <h3>✅ PIX GERADO!</h3>
          <p>Já copiamos o código para você!</p>
          <img src={qrUrl} alt="QR Code Pix" style={{ maxWidth: "280px", borderRadius: "10px" }} />
          <p style={{ marginTop: "15px" }}>Ou use este código:</p>
          <textarea
            readOnly
            value={copiaECola}
            onClick={(e) => {
              e.target.select();
              navigator.clipboard.writeText(copiaECola);
              alert("Copiado novamente!");
            }}
            style={{ 
              width: "100%", 
              height: "100px", 
              fontFamily: "monospace", 
              padding: "10px",
              fontSize: "12px"
            }}
          />
          <p style={{ fontSize: "12px", color: "green" }}>
            ✅ Código copiado automaticamente! Cole no seu banco.
          </p>
        </div>
      )}
    </div>
  );
};

export default Servicos;
