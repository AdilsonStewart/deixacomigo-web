const mercadopago = require("mercadopago");

mercadopago.configure({
  access_token: process.env.MP_ACCESS_TOKEN
});

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Método não permitido" };
  }

  try {
    const { valor, tipo } = JSON.parse(event.body);

    const titulo = tipo.toLowerCase() === "vídeo" 
      ? "Mensagem em Vídeo Surpresa" 
      : "Mensagem em Áudio Surpresa";

    const preference = {
      items: [{
        title: titulo,
        unit_price: Number(valor),
        currency_id: "BRL",
        quantity: 1
      }],
      back_urls: {
        success: "https://deixacomigoweb.netlify.app/sucesso",
        failure: "https://deixacomigoweb.netlify.app/erro",
        pending: "https://deixacomigoweb.netlify.app/erro"
      },
      auto_return: "approved",
      statement_descriptor: "DEIXA COMIGO"
    };

    const result = await mercadopago.preferences.create(preference);

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        success: true,
        init_point: result.body.init_point || result.body.sandbox_init_point
      })
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ success: false })
    };
  }
};
