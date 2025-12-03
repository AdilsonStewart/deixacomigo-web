import React from "react";

const Servicos = () => {

  const pagarPayPal = (tipo, valor) => {
    // URL de retorno
    const returnUrl = `https://deixacomigoweb.netlify.app/retorno?tipo=${tipo}`;
    
    // PayPal URL de checkout usando variável de ambiente
    const PAYPAL_CLIENT = process.env.REACT_APP_PAYPAL_CLIENT; // seu Client ID
    const paypalUrl = `https://www.paypal.com/checkoutnow?amount=${valor}&currency=BRL&client-id=${PAYPAL_CLIENT}&return=${encodeURIComponent(returnUrl)}&custom=${tipo}`;

    window.location.href = paypalUrl;
  };

  return (
    <div style={{ maxWidth: "500px", margin: "50px auto", textAlign: "center" }}>
      <h2>Escolha seu serviço</h2>

      <div style={cardStyle}>
        <h3>ÁUDIO 30s — R$ 5,00</h3>
        <button style={btn} onClick={() => pagarPayPal("audio", 5.00)}>
          Pagar com PayPal
        </button>
      </div>

      <div style={cardStyle}>
        <h3>VÍDEO 30s — R$ 10,00</h3>
        <button style={btn} onClick={() => pagarPayPal("video", 10.00)}>
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

const btn = {
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
