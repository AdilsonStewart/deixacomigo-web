export const handler = async (event) => {
  try {
    const body = JSON.parse(event.body || "{}");

    if (body.event !== "PAYMENT_CONFIRMED") {
      return { statusCode: 200, body: "ignorado" };
    }

    const cobrancaId = body.payment?.id;

    console.log("✅ PAGAMENTO CONFIRMADO:", cobrancaId);

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
