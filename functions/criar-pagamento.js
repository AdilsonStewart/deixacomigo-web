// netlify/functions/criar-pagamento.js
import MercadoPagoConfig from "mercadopago";
import Preference from "mercadopago/dist/clients/preference.js";

export const handler = async (event) => {
  try {
    console.log("📩 EVENTO:", event.body);

    const { valor, tipo } = JSON.parse(event.body || "{}");

    if (!valor || !tipo) {
      return {
        statusCode: 400,
        body: JSON.stringify({ success: false, message: "Dados inválidos" })
      };
    }

    const client = new MercadoPagoConfig({
      accessToken: process.env.MP_ACCESS_TOKEN
    });

    const preferenceClient = new Preference(client);

    let successUrl = "";
    if (tipo === "áudio") successUrl = "https://deixacomigo.netlify.app/sucesso";
    if (tipo === "vídeo") successUrl = "https://deixacomigo.netlify.app/sucesso2";

    const preference = await preferenceClient.create({
      body: {
        items: [
          {
            title: `Mensageiro - ${tipo}`,
            quantity: 1,
            unit_price: Number(valor),
            currency_id: "BRL"
          }
        ],
        back_urls: {
          success: successUrl,
          failure: "https://deixacomigo.netlify.app/erro",
          pending: "https://deixacomigo.netlify.app/pendente"
        },
        auto_return: "approved"
      }
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        init_point: preference.sandbox_init_point || preference.init_point
      })
    };

  } catch (error) {
    console.error("🔥 ERRO:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: error.message })
    };
  }
};
