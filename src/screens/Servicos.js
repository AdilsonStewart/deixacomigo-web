import React, { useEffect } from "react";

const Servicos = () => {
  // Carrega o SDK do PayPal só uma vez
  useEffect(() => {
    const script = document.createElement("script");
    script.src = `https://www.paypal.com/sdk/js?client-id=${process.env.REACT_APP_PAYPAL_CLIENT_ID}&currency=BRL&intent=capture`;
    script.async = true;
    script.onload = () => iniciarBotoesPayPal();
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const iniciarBotoesPayPal = () => {
    if (!window.paypal) return;

    // Botão Áudio R$ 5,00
    window.paypal
      .Buttons({
        createOrder: (data, actions) => {
          return actions.order.create({
            purchase_units: [
              {
                description: "Áudio 30s - Deixa Comigo",
                amount: { currency_code: "BRL", value: "5.00" },
                custom_id: "audio",
              },
            ],
          });
        },
        onApprove: (data, actions) => {
          return actions.order.capture().then((details) => {
            const nome = details.payer.name.given_name;
            alert(`Obrigado, ${nome}! Seu áudio de 30s já está na fila`);
            window.location.href = `https://deixacomigoweb.netlify.app/retorno?tipo=audio&status=success&orderID=${data.orderID}`;
          });
        },
        onCancel: () => {
          window.location.href = "https://deixacomigoweb.netlify.app/retorno?tipo=audio&status=cancel";
        },
        onError: (err) => {
          console.error(err);
          alert("Erro no pagamento. Tenta de novo ou me chama!");
        },
      })
      .render("#paypal-audio");

    // Botão Vídeo R$ 10,00
    window.paypal
      .Buttons({
        createOrder: (data, actions) => {
          return actions.order.create({
            purchase_units: [
              {
                description: "Vídeo 30s - Deixa Comigo",
                amount: { currency_code: "BRL", value: "10.00" },
                custom_id: "video",
              },
            ],
          });
        },
        onApprove: (data, actions) => {
          return actions.order.capture().then((details) => {
            const nome = details.payer.name.given_name;
            alert(`Valeu demais, ${nome}! Seu vídeo de 30s já tá na fila`);
            window.location.href = `https://deixacomigoweb.netlify.app/retorno?tipo=video&status=success&orderID=${data.orderID}`;
          });
        },
        onCancel: () => {
          window.location.href = "https://deixacomigoweb.netlify.app/retorno?tipo=video&status=cancel";
        },
      })
      .render("#paypal-video");
  };

  return (
    <div style={{ maxWidth: "500px", margin: "50px auto", textAlign: "center" }}>
      <h2>Escolha seu serviço</h2>

      {/* CARD ÁUDIO */}
      <div style={cardStyle}>
        <img src="https://deixacomigoweb.netlify.app/audio.gif" alt="Áudio 30s" style={{ width: "100%", borderRadius: "10px", marginBottom: "15px" }} />
        <h3>ÁUDIO 30s — R$ 5,00</h3>
        <div id="paypal-audio" style={{ marginTop: "15px" }}></div>
        {/* Botão azul grande (fallback bonito caso demore carregar) */}
        <button style={btn} onClick={() => alert("Carregando PayPal... aguarde uns segundos")}>
          Pagar com PayPal ou Cartão
        </button>
      </div>

      {/* CARD VÍDEO */}
      <div style={cardStyle}>
        <img src="https://deixacomigoweb.netlify.app/video.gif" alt="Vídeo 30s" style={{ width: "100%", borderRadius: "10px", marginBottom: "15px" }} />
        <h3>VÍDEO 30s — R$ 10,00</h3>
        <div id="paypal-video" style={{ marginTop: "15px" }}></div>
        <button style={btn} onClick={() => alert("Carregando PayPal... aguarde uns segundos")}>
          Pagar com PayPal ou Cartão
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
  marginTop: "10px",
};

export default Servicos;
