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

    // Título limpo (Mercado Pago rejeita acentos e caracteres especiais em produção)
    const titulo = tipo === "video" ? "Mensagem em Vídeo Surpresa" : "Mensagem em Áudio Surpresa";

    const preference = {
      items: [
        {
          title: titulo,
          unit_price: Number(valor),   // já chega como número do front
          currency_id: "BRL",
          quantity: 1
        }
      ],
      back_urls: {
        success: "https://deixacomigoweb.netlify.app/sucesso",
        failure: "https://deixacomigoweb.netlify.app/erro",
        pending: "https://deixacomigoweb.netlify.app/erro"
      },
      auto_return: "approved",
      notification_url: "https://deixacomigoweb.netlify.app/.netlify/functions/webhook-mp", // opcional, mas recomendado
      statement_descriptor: "DEIXA COMIGO" // aparece no cartão do cliente
    };

    const mpResponse = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`   // token de produção
      },
      body: JSON.stringify(preference)
    });

    const data = await mpResponse.json();

    // Erro da API do Mercado Pago
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
        init_point: data.init_point   // esse é o link que abre o checkout de verdade
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
