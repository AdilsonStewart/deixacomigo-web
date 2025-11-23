export const handler = async (event) => {
  try {
    const body = JSON.parse(event.body || "{}");

    // só aceitamos confirmação de pagamento
    if (body.event !== "PAYMENT_CONFIRMED") {
      return { statusCode: 200, body: "ignorado" };
    }

    const cobrancaId = body.payment?.id;

    console.log("✅ PAGAMENTO CONFIRMADO:", cobrancaId);

    // --- AQUI VAMOS LIBERAR O CLIENTE DEPOIS ---
    // ex: salvar no Firestore: pago = true

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true })
    };

  } catch (err) {
    console.log("❌ ERRO WEBHOOK:", err.message);
    return {
      statusCode: 400,
      body: JSON.stringify({ error: err.message })
    };
  }
};
