import React, { useEffect } from "react";

const Servicos = () => {
  // ==================== CARREGA O PAYPAL CORRETAMENTE ====================
  useEffect(() => {
    // Remove script antigo se já existir (evita duplicatas)
    const existente = document.querySelector('script[src*="paypal.com/sdk/js"]');
    if (existente) existente.remove();

    const script = document.createElement("script");
    // <<< AQUI: COLE SEU CLIENT-ID COMPLETO E EXATO (sem espaços extras!) >>>
    // Exemplo: AWcGR2Fa2OoZ8lTaDiGTI... inteiro até o final
    script.src = `https://www.paypal.com/sdk/js?client-id=AWcGR2Fa2OoZ8lTaDiGTIxxxxxxxxxxxxxxxxxxxxxxxx&currency=BRL&intent=capture&disable-funding=credit`;
    // Se quiser adicionar Pix: &enable-funding=pix no final, mas testa sem primeiro

    script.async = true;
    script.onload = () => {
      console.log("PayPal SDK carregado! Botões vão aparecer agora.");
      setTimeout(iniciarBotoesPayPal, 500); // Delayzinho pra garantir
    };
    script.onerror = (e) => {
      console.error("Erro no SDK:", e);
      alert("Erro ao carregar PayPal (código 400). Pode ser o client-id ou ativação da conta. Me manda print do erro!");
    };
    document.head.appendChild(script); // Muda pro head, às vezes ajuda

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  // ==================== CRIA OS BOTÕES DO PAYPAL ====================
  const iniciarBotoesPayPal = () => {
    if (!window.paypal) {
      console.error("PayPal não carregou ainda. Espera 2s e recarrega.");
      return;
    }

    // Botão ÁUDIO R$ 5,00
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
          const nome = details.payer.name?.given_name || "amigo";
          alert(`Obrigado, ${nome}! Seu áudio de 30s já está na fila de produção.`);
          window.location.href = `https://deixacomigoweb.netlify.app/retorno?tipo=audio&status=success&orderID=${data.orderID}`;
        });
      },
      onCancel: () => {
        window.location.href = "https://deixacomigoweb.netlify.app/retorno?tipo=audio&status=cancel";
      },
      onError: (err) => {
        console.error("Erro no pagamento:", err);
        alert("Ops, erro no PayPal. Tenta de novo ou me avisa!");
      },
    }).render("#paypal-audio");

    // Botão VÍDEO R$ 10,00
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
          const nome = details.payer.name?.given_name || "amigo";
          alert(`Valeu, ${nome}! Seu vídeo de 30s já tá na fila de produção.`);
          window.location.href = `https://deixacomigoweb.netlify.app/retorno?tipo=video&status=success&orderID=${data.orderID}`;
        });
      },
      onCancel: () => {
        window.location.href = "https://deixacomigoweb.netlify.app/retorno?tipo=video&status=cancel";
      },
      onError: (err) => {
        console.error("Erro no pagamento:", err);
        alert("Ops, erro no PayPal. Tenta de novo ou me avisa!");
      },
    }).render("#paypal-video");
  };

  return (
    <div style={{ maxWidth: "500px", margin: "50px auto", textAlign: "center" }}>
      <h2>Escolha seu serviço</h2>

      {/* CARD ÁUDIO */}
      <div style={cardStyle}>
        <img
          src="https://deixacomigoweb.netlify.app/audio.gif"
          alt="Áudio 30s"
          style={{ width: "100%", borderRadius: "10px", marginBottom: "15px" }}
        />
        <h3>ÁUDIO 30s — R$ 5,00</h3>
        <div id="paypal-audio" style={{ marginTop: "20px", minHeight: "60px" }}></div>
        <button 
          style={btn} 
          onClick={() => alert("Carregando opções de pagamento... Aguarde o botão azul do PayPal aparecer!")}
        >
          Pagar com PayPal, Cartão ou Pix
        </button>
      </div>

      {/* CARD VÍDEO */}
      <div style={cardStyle}>
        <img
          src="https://deixacomigoweb.netlify.app/video.gif"
          alt="Vídeo 30s"
          style={{ width: "100%", borderRadius: "10px", marginBottom: "15px" }}
        />
        <h3>VÍDEO 30s — R$ 10,00</h3>
        <div id="paypal-video" style={{ marginTop: "20px", minHeight: "60px" }}></div>
        <button 
          style={btn} 
          onClick={() => alert("Carregando opções de pagamento... Aguarde o botão azul do PayPal aparecer!")}
        >
          Pagar com PayPal, Cartão ou Pix
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
  marginTop: "15px",
};

export default Servicos;
