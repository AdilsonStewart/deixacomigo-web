export const handler = async (event) => {
  if (event.httpMethod !== "POST") return { statusCode: 405 };

  console.log("Webhook MP recebido");

  try {
    const body = JSON.parse(event.body || "{}");

    if (body.type === "payment") {
      const paymentId = body.data?.id;
      if (!paymentId) return { statusCode: 200, body: "ok" };

      const res = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}` }
      });
      const payment = await res.json();

      if (payment.status === "approved") {
        const whatsapp = (payment.payer?.phone?.area_code || "") + (payment.payer?.phone?.number || "não informado");
        const valor = payment.transaction_amount;
        const nome = `${payment.payer?.first_name || ""} ${payment.payer?.last_name || ""}`.trim() || "não informado";

        console.log("🎉 PAGAMENTO APROVADO!");
        console.log("Valor: R$", valor);
        console.log("Nome:", nome);
        console.log("WhatsApp:", whatsapp);
      }
    }

    return { statusCode: 200, body: "ok" };
  } catch (err) {
    console.error("Erro no webhook:", err.message);
    return { statusCode: 200, body: "ok" };
  }
};
