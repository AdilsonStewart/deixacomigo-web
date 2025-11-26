const axios = require('axios');

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json"
  };

  console.log("🔔 PicPay - Pix no TEF");

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

    const PICPAY_TOKEN = process.env.PICPAY_TOKEN; // ✅ Já atualizou no Netlify!

    if (!PICPAY_TOKEN) {
      throw new Error("Token PicPay não configurado");
    }

    const descricao = tipo === "vídeo" ? "Mensagem em Vídeo Surpresa" : "Mensagem em Áudio Surpresa";

    console.log("🔄 Criando transação Pix no TEF...");

    // ✅ API para transação Pix
    const response = await axios.post('https://appws.picpay.com/ecommerce/public/payments', {
      referenceId: `pix-${Date.now()}`,
      callbackUrl: "https://deixacomigoweb.netlify.app/sucesso",
      returnUrl: "https://deixacomigoweb.netlify.app/sucesso",
      value: Number(valor),
      description: descricao,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      buyer: {
        firstName: "Cliente",
        lastName: "Site",
        document: "123.456.789-09",
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
    console.log("✅ Transação Pix criada:", data);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        paymentUrl: data.paymentUrl,
        qrcode: data.qrcode,
        referenceId: data.referenceId,
        message: "Pagamento Pix criado com sucesso!"
      })
    };

  } catch (error) {
    console.error("❌ Erro Pix no TEF:", {
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
