export const handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json"
  };

  console.log("🔔 Function criar-pagamento (Mercado Pago) chamada");

  if (event.httpMethod !== "POST") {
    return { 
      statusCode: 405, 
      headers,
      body: JSON.stringify({ success: false, error: "Método não permitido" }) 
    };
  }

  try {
    const body = JSON.parse(event.body || "{}");
    const { valor, tipo } = body;

    if (!valor || !tipo) {
      return { 
        statusCode: 400, 
        headers,
        body: JSON.stringify({ success: false, error: "Faltou valor ou tipo" }) 
      };
    }

    console.log("✅ Dados recebidos:", { valor, tipo });

    const descricao =
      tipo === "vídeo"
        ? "Mensagem em Vídeo Surpresa"
        : "Mensagem em Áudio Surpresa";

    const response = await fetch(
      "https://api.mercadopago.com/checkout/preferences",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: [
            {
              title: descricao,
              quantity: 1,
              currency_id: "BRL",
              unit_price: Number(valor),
            },
          ],

          // 🔥 AQUI ESTÁ O TRECHO CORRETO QUE VOCÊ PRECISA
          payment_methods: {
            excluded_payment_methods: [],
            excluded_payment_types: []
          },

          back_urls: {
            success: "https://deixacomigoweb.netlify.app/aguardando-confirmacao",
            failure: "https://deixacomigoweb.netlify.app/aguardando-confirmacao",
            pending: "https://deixacomigoweb.netlify.app/aguardando-confirmacao",
          },
          auto_return: "approved",
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ Erro Mercado Pago:", data);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, error: data }),
      };
    }

    console.log("✅ Preferência criada com sucesso:", data.id);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        paymentLink: data.init_point,
        id: data.id,
      }),
    };
  } catch (err) {
    console.error("❌ Erro na função:", err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, error: err.message }),
    };
  }
};
