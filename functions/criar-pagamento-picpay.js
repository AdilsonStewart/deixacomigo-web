const axios = require('axios');

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json"
  };

  console.log("🔔 PicPay SANDBOX (Teste)");

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

    console.log("🔄 Criando pagamento no SANDBOX...");

    // ✅ API DO SANDBOX PICPAY
    const response = await axios.post('https://appws.picpay.com/ecommerce/public/payments', {
      referenceId: `teste-${Date.now()}`,
      callbackUrl: "https://deixacomigoweb.netlify.app/.netlify/functions/webhook-pagamento",
      returnUrl: "https://deixacomigoweb.netlify.app/sucesso",
      value: Number(valor),
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      buyer: {
        firstName: "Cliente",
        lastName: "Teste",
        document: "123.456.789-09", // CPF de teste
        email: "cliente@teste.com",
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
    console.log("✅ Pagamento SANDBOX criado:", data);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        paymentUrl: data.paymentUrl,
        qrcode: data.qrcode,
        referenceId: data.referenceId,
        message: "Pagamento de TESTE criado com sucesso!",
        ambiente: "SANDBOX"
      })
    };

  } catch (error) {
    console.error("❌ Erro Sandbox:", {
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
        details: error.response?.data,
        info: "Estas credenciais são para AMBIENTE DE TESTE. Precisa solicitar credenciais de produção."
      })
    };
  }
};
