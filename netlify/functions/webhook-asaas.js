export const handler = async (event) => {
  console.log("🔔 WEBHOOK CHAMADO PELA ASAAS!");
  console.log("📦 Método HTTP:", event.httpMethod);
  console.log("📦 Headers:", JSON.stringify(event.headers, null, 2));
  console.log("📦 Body completo:", event.body);

  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json"
  };

  try {
    // A Asaas pode estar enviando de formas diferentes
    let body;
    
    if (event.body) {
      try {
        body = JSON.parse(event.body);
      } catch (e) {
        // Talvez esteja em outro formato
        body = event.body;
        console.log("⚠️ Body não é JSON, string direta:", body);
      }
    }

    console.log("🎯 Body processado:", JSON.stringify(body, null, 2));

    // Log TUDO para debug
    console.log("🔍 EVENTO COMPLETO:", {
      httpMethod: event.httpMethod,
      headers: event.headers,
      body: body
    });

    // Verifica se é um evento de pagamento
    if (body && (body.event === "PAYMENT_CONFIRMED" || body.event === "PAYMENT_RECEIVED")) {
      const payment = body.payment;
      
      console.log("✅✅✅ PAGAMENTO CONFIRMADO VIA WEBHOOK!");
      console.log("🎯 ID do Pagamento:", payment.id);
      console.log("💵 Valor:", payment.value);
      console.log("📝 Descrição:", payment.description);
      console.log("🔄 Status:", payment.status);

      // AQUI VOCÊ PODE SALVAR NO FIREBASE!
      console.log("🎁 SERVICO LIBERADO PARA O CLIENTE!");

    } else if (body && body.event) {
      console.log("📨 Outro evento recebido:", body.event);
    } else {
      console.log("❓ Evento desconhecido ou sem dados");
    }

    // SEMPRE responde 200 para a Asaas
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true, 
        message: "Webhook recebido com sucesso",
        event: body?.event || "unknown"
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
