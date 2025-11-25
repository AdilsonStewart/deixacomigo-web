export const handler = async (event) => {
  console.log("🔔 WEBHOOK INICIADO - Headers:", event.headers);
  console.log("🔔 WEBHOOK Body:", event.body);

  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json"
  };

  try {
    const body = JSON.parse(event.body || "{}");
    
    console.log("📦 WEBHOOK Dados recebidos:", JSON.stringify(body, null, 2));

    // Log TODOS os eventos para debug
    console.log("🎯 Evento recebido:", body.event);
    console.log("💰 Payment ID:", body.payment?.id);
    console.log("💵 Valor:", body.payment?.value);

    // Só processa confirmações de pagamento
    if (body.event === "PAYMENT_CONFIRMED" || body.event === "PAYMENT_RECEIVED") {
      const payment = body.payment;
      
      console.log("✅ PAGAMENTO CONFIRMADO VIA WEBHOOK!");
      console.log("🎯 ID:", payment.id);
      console.log("💵 Valor:", payment.value);
      console.log("📝 Descrição:", payment.description);

      // AQUI VAMOS SALVAR NO FIREBASE DEPOIS
      console.log("🎁 Serviço liberado para:", payment.id);
    }

    // SEMPRE responde 200 para a Asaas
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true, 
        message: "Webhook processado",
        event: body.event 
      })
    };

  } catch (error) {
    console.log("❌ ERRO no webhook:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        success: false, 
        error: error.message 
      })
    };
  }
};
