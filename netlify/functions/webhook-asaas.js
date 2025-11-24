export const handler = async (event) => {
  console.log("🔔 WEBHOOK CHAMADO!");

  try {
    const body = JSON.parse(event.body || "{}");
    console.log("📦 Dados recebidos:", JSON.stringify(body, null, 2));

    // Verifica se é uma confirmação de pagamento
    if (body.event === "PAYMENT_CONFIRMED") {
      const payment = body.payment;
      console.log("✅ PAGAMENTO CONFIRMADO!");
      console.log("💰 Valor:", payment.value);
      console.log("🎯 ID:", payment.id);
      
      // Aqui vamos decidir para onde mandar o usuário
      if (payment.value === 5.00) {
        console.log("🎧 Cliente comprou ÁUDIO - deve ir para /sucesso");
      } else if (payment.value === 8.00) {
        console.log("🎥 Cliente comprou VÍDEO - deve ir para /sucesso2");
      }
    }

    // SEMPRE responde 200 para a Asaas
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, message: "Webhook recebido" })
    };

  } catch (error) {
    console.log("❌ ERRO no webhook:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
