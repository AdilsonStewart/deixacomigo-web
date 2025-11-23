import React from 'react';

const Servicos = () => {
  const pagar = async (valor, tipo) => {
    try {
      const res = await fetch("/api/criar-pagamento", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          valor,
          tipo,
          metodo: "pix"
        })
      });

      const data = await res.json();

      if (data.success && data.paymentLink) {
        window.location.href = data.paymentLink;
      } else {
        alert("Erro: " + JSON.stringify(data));
      }
    } catch (e) {
      alert("Erro de rede. Tente novamente.");
    }
  };

  return (
    <div style={{ textAlign: "center", padding: "40px" }}>
      
      {/* GIF da corujinha — pode trocar quando enviar o seu */}
      <img 
        src="https://media.giphy.com/media/26BRv0ThflsHCqDrG/giphy.gif"
        alt="Corujinha"
        style={{ width: "180px", marginBottom: "30px" }}
      />

      {/* Botão Áudio */}
      <button
        onClick={() => pagar(1.99, "áudio")}
        style={{
          padding: "18px 35px",
          fontSize: "1.4rem",
          background: "#ff6ec7",
          color: "white",
          border: "none",
          borderRadius: "12px",
          marginBottom: "20px",
          cursor: "pointer",
          width: "250px"
        }}
      >
        Áudio — R$ 1,99
      </button>

      <br />

      {/* Botão Vídeo */}
      <button
        onClick={() => pagar(4.99, "vídeo")}
        style={{
          padding: "18px 35px",
          fontSize: "1.4rem",
          background: "#ff9f43",
          color: "white",
          border: "none",
          borderRadius: "12px",
          cursor: "pointer",
          width: "250px"
        }}
      >
        Vídeo — R$ 4,99
      </button>
    </div>
  );
};

export default Servicos;
