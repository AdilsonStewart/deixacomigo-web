import mercadopago from "mercadopago";

export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Método não permitido" }),
    };
  }

  try {
    // Pegando os valores enviados pelo front
    const { valor, tipo } = JSON.parse(event.body);

    // Configura o Mercado Pago com seu Access Token do Netlify
    mercadopago.configurations.setAccessToken(process.env.MP_ACCESS_TOKEN);

    // Cria a preferência de pagamento real
    const preference = {
      items: [
        {
          title: `Lembrete em ${tipo}`,
          quantity: 1,
          unit_price: Number(valor)
        }
      ],
      back_urls: {
        success: "https://deixacomigoweb.netlify.app/sucesso",
        failure: "https://deixacomigoweb.netlify.app/falha",
        pending: "https://deixacomigoweb.netlify.app/pendente",
      },
      auto_return: "approved"
    };

    const result = await mercadopago.preferences.create(preference);

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        success: true,
        init_point: result.body.init_point,   // Link REAL
        preference_id: result.body.id
      })
    };

  } catch (error) {
    console.error("Erro MP:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: error.message }),
    };
  }
};
