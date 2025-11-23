import React from "react";

const Servicos = () => {
  const pagarAudio = async () => {
    const res = await fetch("/api/criar-pix-asaas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        valor: 5.00,
        tipo: "áudio",
        metodo: "pix"
      })
    });

    const data = await res.json();
    if (data.success && data.paymentLink) {
      window.location.href = data.paymentLink;
    } else {
      alert("Erro: " + JSON.stringify(data));
    }
  };

  return (
    <div style={{ textAlign: "center", padding: "50px" }}>
      <img
        src="https://i.ibb.co/mT1t7Lx/coruja-rosa.gif"
        alt="coruja"
        style={{ width: "180px", marginBottom: "30px" }}
      />

      <h2>Escolha seu serviço</h2>

      <button
        onClick={pagarAudio}
        style={{
          padding: "20px 40px",
          fontSize: "1.5rem",
          background: "#ff4dd2",
          color: "white",
          border: "none",
          borderRadius: "10px",
          marginTop: "30px"
        }}
      >
        ÁUDIO — R$ 5,00
      </button>
    </div>
  );
};

export default Servicos;
