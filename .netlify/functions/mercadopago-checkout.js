const mercadopago = require("mercadopago");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Método não permitido" }),
    };
  }

  try {
    const { tipo } = JSON.parse(event.body);

    // 🔥 Definindo valores fixos por segurança
    const precos = {
      audio: 1.99,
      video: 4.99
    };

    const valor = precos[tipo] || null;

    if (!valor) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Tipo de pagamento inválido" }),
      };
    }

    // 🔐 Token armazenado no Netlify
    mercadopago.configurations.setAccessToken(process.env.MP_ACCESS_TOKEN);

    // 🔄 Redirecionamentos conforme o tipo
    const successUrl =
      tipo === "audio"
        ? "https://deixacomigoweb.netlify.app/sucesso"
        : "https://deixacomigoweb.netlify.app/sucesso2";

    const preference = {
      items: [
        {
          title: `Lembrete em ${tipo}`,
          quantity: 1,
          unit_price: Number(valor),
          currency_id: "BRL",
        }
      ],
      back_urls: {
        success: successUrl,
        failure: "https://deixacomigoweb.netlify.app/erro",
        pending: "https://deixacomigoweb.netlify.app/erro"
      },
      auto_return: "approved"
    };

    const result = await mercadopago.preferences.create(preference);

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        success: true,
        init_point: result.body.init_point,
        preference_id: result.body.id
      })
    };

  } catch (error) {
    console.error("Erro MP:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: error.message,
      }),
    };
  }
};
