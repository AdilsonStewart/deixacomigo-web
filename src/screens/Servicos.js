import React, { useEffect } from "react";

const Servicos = () => {
  useEffect(() => {
    // Substitua YOUR_PAYPAL_CLIENT_ID pelo seu client id do PayPal
    const PAYPAL_CLIENT_ID = "YOUR_PAYPAL_CLIENT_ID";

    // evita múltiplas inserções do script
    if (!document.getElementById("paypal-sdk")) {
      const script = document.createElement("script");
      script.id = "paypal-sdk";
      script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=BRL`;
      script.async = true;
      script.onload = () => renderButtons();
      document.body.appendChild(script);
    } else {
      renderButtons();
    }

    function renderButtons() {
      if (!window.paypal) return;

      // Botão ÁUDIO R$ 5,00
      try {
        window.paypal.Buttons({
          createOrder: (data, actions) => {
            return actions.order.create({
              purchase_units: [
                {
                  description: "Áudio 30s - Deixa Comigo",
                  amount: { currency_code: "BRL", value: "5.00" },
                  custom_id: "audio_30s",
                },
              ],
            });
          },
          onApprove: (data, actions) => {
            return actions.order.capture().then((details) => {
              const nome = details.payer?.name?.given_name || "amigo";
              alert(`Valeu, ${nome}! Seu áudio de 30s já tá na fila de produção.`);
              // usa origem atual do host (funciona no Vercel)
              window.location.href = `${window.location.origin}/retorno?tipo=audio&status=success&orderID=${data.orderID}`;
            });
          },
          onCancel: () => {
            window.location.href = `${window.location.origin}/retorno?tipo=audio&status=cancel`;
          },
          onError: (err) => {
            console.error("Erro no pagamento (audio):", err);
            alert("Ops, erro no PayPal. Tenta de novo!");
          },
        }).render("#paypal-audio");
      } catch (e) {
        console.error("Erro ao renderizar botão PayPal (audio):", e);
      }

      // Botão VÍDEO R$ 10,00
      try {
        window.paypal.Buttons({
          createOrder: (data, actions) => {
            return actions.order.create({
              purchase_units: [
                {
                  description: "Vídeo 30s - Deixa Comigo",
                  amount: { currency_code: "BRL", value: "10.00" },
                  custom_id: "video_30s",
                },
              ],
            });
          },
          onApprove: (data, actions) => {
            return actions.order.capture().then((details) => {
              const nome = details.payer?.name?.given_name || "amigo";
              alert(`Valeu, ${nome}! Seu vídeo de 30s já tá na fila de produção.`);
              window.location.href = `${window.location.origin}/retorno?tipo=video&status=success&orderID=${data.orderID}`;
            });
          },
          onCancel: () => {
            window.location.href = `${window.location.origin}/retorno?tipo=video&status=cancel`;
          },
          onError: (err) => {
            console.error("Erro no pagamento (video):", err);
            alert("Ops, erro no PayPal. Tenta de novo!");
          },
        }).render("#paypal-video");
      } catch (e) {
        console.error("Erro ao renderizar botão PayPal (video):", e);
      }
    }

    // cleanup para evitar duplicação se o componente desmontar/remontar
    return () => {
      try {
        const audioNode = document.getElementById("paypal-audio");
        const videoNode = document.getElementById("paypal-video");
        if (audioNode) audioNode.innerHTML = "";
        if (videoNode) videoNode.innerHTML = "";
      } catch (e) {
        // ignore
      }
    };
  }, []);

  const btn = {
    backgroundColor: "#007bff",
    color: "white",
    padding: "10px 16px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    marginTop: "10px"
  };

  return (
    <div style={{ maxWidth: "500px", margin: "50px auto", textAlign: "center" }}>
      <h2>Escolha seu serviço</h2>

      <div style={{
        backgroundColor: "#f8f9fa",
        padding: "20px",
        marginBottom: "20px",
        borderRadius: "12px",
        boxShadow: "0 4px 8px rgba(0,0,0,0.05)"
      }}>
        <img
          src="https://deixacomigoweb.netlify.app/audio.gif"
          alt="Áudio 30s"
          style={{ width: "100%", borderRadius: "10px", marginBottom: "15px" }}
        />
        <h3>ÁUDIO 30s — R$ 5,00</h3>
        <div id="paypal-audio" style={{ marginTop: "20px", minHeight: "60px" }}></div>
        <button style={btn} onClick={() => alert("Aguarde o botão azul do PayPal aparecer!")}>
          Pagar com PayPal, Cartão ou Pix
        </button>
      </div>

      <div style={{
        backgroundColor: "#f8f9fa",
        padding: "20px",
        marginBottom: "20px",
        borderRadius: "12px",
        boxShadow: "0 4px 8px rgba(0,0,0,0.05)"
      }}>
        <img
          src="https://deixacomigoweb.netlify.app/video.gif"
          alt="Vídeo 30s"
          style={{ width: "100%", borderRadius: "10px", marginBottom: "15px" }}
        />
        <h3>VÍDEO 30s — R$ 10,00</h3>
        <div id="paypal-video" style={{ marginTop: "20px", minHeight: "60px" }}></div>
        <button style={btn} onClick={() => alert("Aguarde o botão azul do PayPal aparecer!")}>
          Pagar com PayPal, Cartão ou Pix
        </button>
      </div>
    </div>
  );
};

export default Servicos;
