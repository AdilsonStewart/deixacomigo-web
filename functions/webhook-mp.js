export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405 };
  }

  try {
    const data = JSON.parse(event.body);

    // Só interessa pagamento criado/aprovado
    if (data.type === "payment" && data.action === "payment.created") {
      const paymentId = data.data.id;

      const res = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: {
          Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`
        }
      });

      const payment = await res.json();

      if (payment.status === "approved") {
        // Aqui pega o WhatsApp que a pessoa digitou no checkout
        const whatsapp = payment.payer?.phone?.area_code + payment.payer?.phone?.number || "não informado";
        const valor = payment.transaction_amount;

        console.log("🎉 PAGAMENTO APROVADO!");
        console.log("Valor: R$", valor);
        console.log("WhatsApp: " + whatsapp);
        console.log("Nome: " + (payment.payer?.first_name || "") + " " + (payment.payer?.last_name || ""));
      }
    }

    return { statusCode: 200, body: "ok" };
  } catch (error) {
    console.error("Erro no webhook:", error);
    return { statusCode: 200, body: "ok" };
  }
};
