const axios = require('axios');

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json"
  };

  console.log("🔔 Mercado Pago - Criando pagamento");

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

    const ACCESS_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN;

    if (!ACCESS_TOKEN) {
      throw new Error("Access Token do Mercado Pago não configurado");
    }

    const descricao = tipo === "vídeo" ? "Mensagem em Vídeo Surpresa" : "Mensagem em Áudio Surpresa";

    console.log("🔄 Criando preferência no Mercado Pago...");

    const response = await axios.post('https://api.mercadopago.com/checkout/preferences', {
      items: [
        {
          title: descricao,
          quantity: 1,
          currency_id: "BRL",
          unit_price: Number(valor)
        }
      ],
      back_urls: {
        success: "https://deixacomigoweb.netlify.app/sucesso",
        failure: "https://deixacomigoweb.netlify.app/",
        pending: "https://deixacomigoweb.netlify.app/"
      },
      auto_return: "approved",
      statement_descriptor: "DeixaComigo",
      expires: true,
      expiration_date_from: new Date().toISOString(),
      expiration_date_to: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 minutos
    }, {
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    const data = response.data;
    console.log("✅ Mercado Pago - Preferência criada:", data.id);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        paymentUrl: data.init_point, // URL de pagamento
        sandbox_init_point: data.sandbox_init_point, // URL de teste
        id: data.id,
        message: "Pagamento criado com sucesso!"
      })
    };

  } catch (error) {
    console.error("❌ Erro Mercado Pago:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: error.response?.data?.message || error.message,
        details: error.response?.data
      })
    };
  }
};
