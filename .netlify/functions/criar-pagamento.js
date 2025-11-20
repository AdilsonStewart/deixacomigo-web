export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Método não permitido" };
  }

  try {
    const { valor, tipo } = JSON.parse(event.body);

    // Remove acentos para evitar erro silencioso no Mercado Pago
    const tipoSanitizado = tipo.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    const preferenceData = {
      items: [
        {
          title: `Lembrete em ${tipoSanitizado}`,
          quantity: 1,
          currency_id: "BRL",
          unit_price: Number(valor)
        }
      ],
      back_urls: {
        success: "https://deixacomigoweb.netlify.app/sucesso",
        failure: "https://deixacomigoweb.netlify.app/erro",
        pending: "https://deixacomigoweb.netlify.app/erro"
      },
      auto_return: "approved"
    };

    // Chamada oficial Mercado Pago
    const response = await fetch(
      "https://api.mercadopago.com/checkout/preferences",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(preferenceData)
      }
    );

    const data = await response.json();

    // Se houver erro na API, retornar mensagem clara
    if (data.error) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          message: "Erro do Mercado Pago",
          details: data
        })
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        init_point: data.init_point,
        sandbox_init_point: data.sandbox_init_point,
        preference_id: data.id
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: error.message })
    };
  }
};
