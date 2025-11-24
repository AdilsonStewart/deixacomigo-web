import React, { useState } from "react";

const Servicos = () => {
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

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto", textAlign: "center" }}>
      <img src="/coruja-rosa.gif" alt="coruja" style={{ width: "180px" }} />
      <h2>Escolha seu serviço</h2>

      <button onClick={testarFunction} disabled={loading}>
        {loading ? "TESTANDO..." : "TESTAR ASASS"}
      </button>
      <br /><br />

      <p>Clique no botão para testar a Asaas</p>
    </div>
  );
};

export default Servicos;
