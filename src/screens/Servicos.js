import React, { useState } from "react";

const Servicos = () => {
  const [copiaECola, setCopiaECola] = useState("");
  const [loading, setLoading] = useState(false);

  const testarFunction = async () => {
    setLoading(true);
    try {
      const resposta = await fetch("/.netlify/functions/criar-pix-asaas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ valor: 5, tipo: "teste" })
      });
      
      const dados = await resposta.json();
      alert("Resposta: " + JSON.stringify(dados));
    } catch (erro) {
      alert("Erro: " + erro.message);
    } finally {
      setLoading(false);
    }
  };

  // GERA QR CODE COM SERVIÇO GRÁTIS (não precisa instalar nada)
  const qrUrl = copiaECola
    ? `https://chart.googleapis.com/chart?chs=300x300&cht=qr&chl=${encodeURIComponent(copiaECola)}`
    : "";

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto", textAlign: "center" }}>
      <img src="/coruja-rosa.gif" alt="coruja" style={{ width: "180px" }} />
      <h2>Escolha seu serviço</h2>

      <button onClick={testarFunction} disabled={loading}>
        {loading ? "TESTANDO..." : "TESTAR ASASS"}
      </button>
      <br /><br />

      {copiaECola && (
        <div style={{ marginTop: "30px" }}>
          <h3>Pague com Pix</h3>
          <img src={qrUrl} alt="QR Code Pix" style={{ maxWidth: "280px", borderRadius: "10px" }} />
          <p style={{ marginTop: "15px" }}>Ou copie o código:</p>
          <textarea
            readOnly
            value={copiaECola}
            onClick={(e) => e.target.select()}
            style={{ width: "100%", height: "100px", fontFamily: "monospace", padding: "10px" }}
          />
        </div>
      )}
    </div>
  );
};

export default Servicos;
