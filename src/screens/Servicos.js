import React from "react";

const Servicos = () => {
  // --- BOTÃO DE 5,00 ---
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

  // --- BOTÃO DE 8,00 ---
  const pagarVideo = async () => {
    const res = await fetch("/api/criar-pix-asaas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        valor: 8.00,
        tipo: "vídeo",
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
          marginTop: "30px",
          display: "block",
          margin: "30px auto"
        }}
      >
        ÁUDIO — R$ 5,00
      </button>

      <button
        onClick={pagarVideo}
        style={{
          padding: "20px 40px",
          fontSize: "1.5rem",
          background: "#ff8c00",
          color: "white",
          border: "none",
          borderRadius: "10px",
          marginTop: "20px",
          display: "block",
          margin: "20px auto"
        }}
      >
        VÍDEO — R$ 8,00
      </button>
    </div>
  );
};

export default Servicos;
