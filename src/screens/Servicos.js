import React from "react";

const Servicos = () => {
  // Seu Client ID do sandbox (depois troca pro live)
  const PAYPAL_CLIENT_ID = process.env.REACT_APP_PAYPAL_CLIENT_ID; // crie essa variável no .env

  return (
    <>
      {/* Carrega o SDK do PayPal uma única vez */}
      <script src={`https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=BRL&intent=capture`} />

      <div style={{ maxWidth: "500px", margin: "50px auto", textAlign: "center" }}>
        <h2>Escolha seu serviço</h2>

        {/* ÁUDIO 30s — R$ 5,00 */}
        <div style={cardStyle}>
          <h3>ÁUDIO 30s — R$ 5,00</h3>
          <div id="paypal-audio-button"></div>
        </div>

        {/* VÍDEO 30s — R$ 10,00 */}
        <div style={cardStyle}>
          <h3>VÍDEO 30s — R$ 10,00</h3>
          <div id="paypal-video-button"></div>
        </div>
      </div>

      {/* Script que roda depois que o SDK carrega */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            if (window.paypal) {
              // Botão Áudio R$ 5,00
              paypal.Buttons({
                createOrder: (data, actions) => {
                  return actions.order.create({
                    purchase_units: [{
                      {
                        description: "Áudio 30s - Deixa Comigo",
                        amount: { currency_code: "BRL", value: "5.00" },
                        custom_id: "audio" // vai voltar no retorno
                      }]
                  });
                },
                onApprove: (data, actions) => {
                  return actions.order.capture().then((details) => {
                    // Pagamento concluído com sucesso!
                    const nome = details.payer.name.given_name;
                    const tipo = "audio";
                    alert(\`Obrigado, \${nome}! Seu áudio de 30s já está na fila\`);
                    
                    // Redireciona para sua página de retorno com os dados
                    window.location.href = \`https://deixacomigoweb.netlify.app/retorno?tipo=\${tipo}&status=success&orderID=\${data.orderID}\`;
                  });
                },
                onCancel: () => {
                  alert("Pagamento cancelado. Quando quiser é só voltar!");
                  window.location.href = "https://deixacomigoweb.netlify.app/retorno?tipo=audio&status=cancel";
                },
                onError: (err) => {
                  console.error(err);
                  alert("Ocorreu um erro no pagamento. Tenta de novo ou me chama no Whats!");
                }
              }).render("#paypal-audio-button");

              // Botão Vídeo R$ 10,00 (cópia quase idêntica)
              paypal.Buttons({
                createOrder: (data, actions) => {
                  return actions.order.create({
                    purchase_units: [{
                      description: "Vídeo 30s - Deixa Comigo",
                      amount: { currency_code: "BRL", value: "10.00" },
                      custom_id: "video"
                    }]
                  });
                },
                onApprove: (data, actions) => {
                  return actions.order.capture().then((details) => {
                    const nome = details.payer.name.given_name;
                    alert(\`Valeu demais, \${nome}! Seu vídeo de 30s já tá na fila\`);
                    window.location.href = \`https://deixacomigoweb.netlify.app/retorno?tipo=video&status=success&orderID=\${data.orderID}\`;
                  });
                },
                onCancel: () => {
                  window.location.href = "https://deixacomigoweb.netlify.app/retorno?tipo=video&status=cancel";
                },
                onError: (err) => {
                  console.error(err);
                  alert("Ocorreu um erro no pagamento. Tenta novamente!");
                }
              }).render("#paypal-video-button");
            }
          `,
        }}
      />
    </>
  );
};

const cardStyle = {
  backgroundColor: "#f8f9fa",
  padding: "20px",
  borderRadius: "10px",
  margin: "20px 0",
  border: "2px solid #e9ecef",
};

export default Servicos;
