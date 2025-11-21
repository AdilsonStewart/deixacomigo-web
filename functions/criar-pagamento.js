// functions/criar-pagamento.js
const { MercadoPagoConfig, Preference } = require("mercadopago");

exports.handler = async (event) => {
  try {
    console.log("📩 EVENTO RECEBIDO:", event.body);

    const { valor, tipo } = JSON.parse(event.body || "{}");

    console.log("🎯 VALOR:", valor, "TIPO:", tipo);

    if (!valor || !tipo) {
      console.log("❌ Dados inválidos!");
      return {
        statusCode: 400,
        body: JSON.stringify({ success: false, message: "Dados inválidos" }),
      };
    }

    if (!process.env.MP_ACCESS_TOKEN) {
      console.log("❌ MP_ACCESS_TOKEN está vazio!");
      return {
        statusCode: 500,
        body: JSON.stringify({
          success: false,
          message: "Token Mercado Pago não configurado",
        }),
      };
    }

    // ⚡ SDK nova — assim que se configura
    const client = new MercadoPagoConfig({
      accessToken: process.env.MP_ACCESS_TOKEN,
    });

    const preference = new Preference(client);

    let successUrl = "";
    if (tipo === "áudio") successUrl = "https://deixacomigo.netlify.app/sucesso";
    if (tipo === "vídeo") successUrl = "https://deixacomigo.netlify.app/sucesso2";

    const prefData = {
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

    console.log("📦 Preferência enviada:", prefData);

    const result = await preference.create({ body: prefData });

    console.log("✅ RESULTADO MP:", result);

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        init_point: result.init_point,
      }),
    };
  } catch (error) {
    console.error("🔥 ERRO NO SERVIDOR:", error);

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
