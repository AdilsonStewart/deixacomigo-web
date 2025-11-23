import React from 'react';

const Servicos = () => {
  const pagar = async (tipo) => {
    try {
      const res = await fetch("/api/criar-pagamento", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          valor: 5.00,   // 🔥 fixo para evitar erro da Asaas
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
      <img 
        src="https://media.giphy.com/media/26BRv0ThflsHCqDrG/giphy.gif"
        alt="Corujinha"
        style={{ width: "180px", marginBottom: "30px" }}
      />

      <button
        onClick={() => pagar("áudio")}
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
        Áudio — R$ 5,00
      </button>

      <br />

      <button
        onClick={() => pagar("vídeo")}
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
        Vídeo — R$ 8,00
      </button>
    </div>
  );
};

export default Servicos;
