// functions/criar-pagamento.js
const mercadopago = require("mercadopago");

exports.handler = async (event) => {
  try {
    const { valor, tipo } = JSON.parse(event.body || "{}");

    console.log("📩 Evento recebido:", event.body);

    if (!valor || !tipo) {
      return {
        statusCode: 400,
        body: JSON.stringify({ success: false, message: "Dados inválidos" }),
      };
    }

    // Configura Mercado Pago (SDK antiga — FUNCIONA)
    mercadopago.configure({
      access_token: process.env.MP_ACCESS_TOKEN,
    });

    let successUrl = "";
    if (tipo === "áudio") successUrl = "https://deixacomigo.netlify.app/sucesso";
    if (tipo === "vídeo") successUrl = "https://deixacomigo.netlify.app/sucesso2";

    const preference = {
      items: [
        {
          title: `Mensageiro - ${tipo}`,
          quantity: 1,
          currency_id: "BRL",
          unit_price: Number(valor),
        },
      ],
      back_urls: {
        success: successUrl,
        failure: "https://deixacomigo.netlify.app/erro",
        pending: "https://deixacomigo.netlify.app/pendente",
      },
      auto_return: "approved",
    };

    const result = await mercadopago.preferences.create(preference);

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        init_point: result.body.init_point,
      }),
    };

  } catch (error) {
    console.error("🔥 ERRO:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: error.message,
      }),
    };
  }
};
