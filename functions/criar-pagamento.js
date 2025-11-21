// functions/criar-pagamento.js
const mercadopago = require("mercadopago");

exports.handler = async (event) => {
  try {
    const { valor, tipo } = JSON.parse(event.body || "{}");

    if (!valor || !tipo) {
      return {
        statusCode: 400,
        body: JSON.stringify({ success: false, message: "Dados inválidos" }),
      };
    }

    // Configura Mercado Pago
    mercadopago.configure({
      access_token: process.env.MP_ACCESS_TOKEN,
    });

    // USE SEU DOMÍNIO CORRETO
    const BASE = "https://deixacomigoweb.netlify.app";

    let successUrl = "";
    if (tipo === "áudio") successUrl = `${BASE}/sucesso`;
    if (tipo === "vídeo") successUrl = `${BASE}/sucesso2`;

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
        failure: `${BASE}/erro`,
        pending: `${BASE}/pendente`,
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
    console.error("Erro ao criar pagamento:", error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        message: "Erro interno ao criar pagamento",
        error: error.message,
      }),
    };
  }
};
