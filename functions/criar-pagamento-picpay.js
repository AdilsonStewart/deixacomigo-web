const axios = require('axios');

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json"
  };

  console.log("🔔 Gateway PicPay - E-commerce");

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

    const PICPAY_TOKEN = process.env.PICPAY_TOKEN;

    if (!PICPAY_TOKEN) {
      throw new Error("Token PicPay não configurado");
    }

    const descricao = tipo === "vídeo" ? "Mensagem em Vídeo Surpresa" : "Mensagem em Áudio Surpresa";

    console.log("🔄 Criando pagamento via Gateway...");

    // ✅ API DO GATEWAY PICPAY (E-COMMERCE)
    const response = await axios.post('https://appws.picpay.com/ecommerce/public/payments', {
      referenceId: `pedido-${Date.now()}`,
      callbackUrl: "https://deixacomigoweb.netlify.app/.netlify/functions/webhook-pagamento",
      returnUrl: "https://deixacomigoweb.netlify.app/sucesso",
      value: Number(valor),
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      buyer: {
        firstName: "Cliente",
        lastName: "Site",
        document: "123.456.789-00",
        email: "cliente@site.com",
        phone: "+55-11-99999-9999"
      }
    }, {
      headers: {
        'x-picpay-token': PICPAY_TOKEN,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    const data = response.data;
    console.log("✅ Pagamento Gateway criado:", data);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        paymentUrl: data.paymentUrl,
        qrcode: data.qrcode,
        referenceId: data.referenceId,
        message: "Pagamento criado com sucesso!"
      })
    };

  } catch (error) {
    console.error("❌ Erro Gateway:", {
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
