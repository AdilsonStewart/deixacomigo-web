import mercadopago from "mercadopago";

export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Método não permitido" }),
    };
  }

  try {
    const { valor, tipo } = JSON.parse(event.body);

    mercadopago.configurations.setAccessToken(process.env.MP_ACCESS_TOKEN);

    const preference = {
      items: [
        {
          title: `Lembrete em ${tipo}`,
          quantity: 1,
          unit_price: Number(valor),
        },
      ],
      back_urls: {
        success: "https://seu-site.netlify.app/sucesso",
        failure: "https://seu-site.netlify.app/falha",
        pending: "https://seu-site.netlify.app/pendente",
      },
      auto_return: "approved",
    };

    const result = await mercadopago.preferences.create(preference);

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        success: true,
        init_point: result.body.init_point,
        preference_id: result.body.id,
      }),
    };
  } catch (error) {
    console.error("Erro MP:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: error.message }),
    };
  }
};
