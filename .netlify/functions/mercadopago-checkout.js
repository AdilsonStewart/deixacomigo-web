export const handler = async (event) => {
  // Só aceita POST
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Método não permitido" };
  }

  try {
    const { valor, tipo } = JSON.parse(event.body);

    if (!valor || !tipo) {
      return {
        statusCode: 400,
        body: JSON.stringify({ success: false, message: "Valor ou tipo ausente" })
      };
    }

    // Título limpo (Mercado Pago rejeita acentos em produção)
    const titulo =
      tipo === "video"
        ? "Mensagem em Video Surpresa"
        : "Mensagem em Audio Surpresa";

    // ✅ URLs de retorno
    let backUrls = {
      success: "https://deixacomigoweb.netlify.app/sucesso",
      failure: "https://deixacomigoweb.netlify.app/erro",
      pending: "https://deixacomigoweb.netlify.app/erro"
    };

    // ✅ Se o valor for 4,99 muda a página de retorno
    if (Number(valor) === 4.99) {
      backUrls.success = "https://deixacomigoweb.netlify.app/sucesso2";
    }

    const preference = {
      items: [
        {
          title: titulo,
          unit_price: Number(valor),
          currency_id: "BRL",
          quantity: 1
        }
      ],
      back_urls: backUrls,
      auto_return: "approved",
      notification_url:
        "https://deixacomigoweb.netlify.app/.netlify/functions/webhook-mp",
      statement_descriptor: "DEIXA COMIGO"
    };

    const mpResponse = await fetch(
      "https://api.mercadopago.com/checkout/preferences",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`
        },
        body: JSON.stringify(preference)
      }
    );

    const data = await mpResponse.json();

    if (!mpResponse.ok || data.error) {
      console.error("Erro Mercado Pago:", data);
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          message: "Erro no Mercado Pago",
          details: data.message || data
        })
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        preferenceId: data.id,
        init_point: data.init_point
      })
    };
  } catch (error) {
    console.error("Erro interno:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        message: "Erro interno no servidor",
        error: error.message
      })
    };
  }
};
