export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Método não permitido" };
  }

  try {
    const { valor, tipo } = JSON.parse(event.body);

    const titulo = tipo.toLowerCase() === "vídeo" ? "Mensagem em Vídeo Surpresa" : "Mensagem em Áudio Surpresa";

    const preference = {
      items: [
        {
          title: titulo,
          unit_price: Number(valor),
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
      statement_descriptor: "DEIXA COMIGO"
    };

    const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`
      },
      body: JSON.stringify(preference)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Erro MP:", data);
      return { statusCode: 400, body: JSON.stringify({ success: false, message: data.message || "Erro no Mercado Pago" }) };
    }

    // <<< AQUI É O QUE O FRONTEND ESPERA >>>
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        init_point: data.init_point   // exatamente esse nome e formato
      })
    };

  } catch (error) {
    console.error("Erro interno:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, message: "Erro interno no servidor" })
    };
  }
};
