import React from "react";

const Servicos = () => {
  return (
    <div style={{ maxWidth: "500px", margin: "50px auto", textAlign: "center" }}>
      <img
        src="https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExc2ptcWV6bGhpdTF4cWJhd25yanZvNGVpb25vcGhiaGY1d2Qya3NraiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/MYzuiycbNu0J9lKrcz/giphy.gif"
        alt="coruja fofinha"
        style={{
          width: "180px",
          borderRadius: "50%",
          border: "3px solid #ff69b4",
          boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
        }}
      />

      <h2 style={{ marginTop: "20px", color: "#333" }}>Escolha seu serviço</h2>

      {/* ÁUDIO - R$ 5,00 */}
      <div style={cardStyle}>
        <h3 style={{ color: "#28a745", marginBottom: "15px" }}>
          ÁUDIO 30s — R$ 5,00
        </h3>

        <button
          style={btnCartao}
          onClick={() => {
            // SALVA tipo para a página retorno.js
            localStorage.setItem("tipoCompra", "audio");

            // Vai para PayPal
            window.location.href = "https://www.paypal.com/ncp/payment/AZQP9SCDU33AE";
          }}
        >
          Pagar com PayPal
        </button>
      </div>

      {/* VÍDEO - R$ 10,00 */}
      <div style={cardStyle}>
        <h3 style={{ color: "#007bff", marginBottom: "15px" }}>
          VÍDEO 30s — R$ 10,00
        </h3>

        <button
          style={btnCartao}
          onClick={() => {
            // SALVA tipo para a página retorno.js
            localStorage.setItem("tipoCompra", "video");

            // Vai para PayPal
            window.location.href = "https://www.paypal.com/ncp/payment/AM34Z2WZ8EQXQ";
          }}
        >
          Pagar com PayPal
        </button>
      </div>
    </div>
  );
};

const cardStyle = {
  backgroundColor: "#f8f9fa",
  padding: "20px",
  borderRadius: "10px",
  margin: "20px 0",
  border: "2px solid #e9ecef",
};

const btnCartao = {
  backgroundColor: "#0066CC",
  color: "white",
  padding: "14px",
  border: "none",
  borderRadius: "10px",
  fontSize: "16px",
  fontWeight: "bold",
  cursor: "pointer",
  width: "100%",
};

export default Servicos;
