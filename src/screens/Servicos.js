import React from 'react';

const Servicos = () => {
  const pagar = async () => {
    try {
      const res = await fetch("/netlify/functions/criar-pagamento", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          valor: 5.00,
          tipo: "áudio",
          metodo: "pix"   // ou "cartao" se quiser testar cartão
        })
      });

      const data = await res.json();

      if (data.success && data.paymentLink) {
        window.location.href = data.paymentLink;
      } else {
        alert("Erro: " + JSON.stringify(data));
      }
    } catch (e) {
      alert("Erro de rede. Abre em aba anônima.");
    }
  };

  return (
    <div style={{ textAlign: "center", padding: "50px" }}>
      <h1>Teste Rápido Asaas</h1>
      <button 
        onClick={pagar}
        style={{ padding: "20px 40px", fontSize: "1.5rem" }}
      >
        PAGAR R$ 5,00 COM PIX (teste)
      </button>
    </div>
  );
};

export default Servicos;
