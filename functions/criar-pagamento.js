const mercadopago = require("mercadopago");

exports.handler = async (event, context) => {
  try {
    const { valor, tipo } = JSON.parse(event.body || "{}");

    if (!valor || !tipo) {
      return {
        statusCode: 400,
        body: JSON.stringify({ success: false, message: "Dados inválidos" }),
      };
    }

    // CONFIGURAR MERCADO PAGO
    mercadopago.configure({
      access_token: process.env.MP_ACCESS_TOKEN, // coloque no Netlify como variável
    });

    // CRIAÇÃO DA PREFERÊNCIA
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
        success: "https://deixacomigo.netlify.app/sucesso2",
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
