const axios = require('axios');

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json"
  };

  console.log("🎯 PICPAY EXCLUSIVO - SEM COMPROMISSOS");

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

    // ✅ CREDENCIAIS DE PRODUÇÃO PICPAY
    const CLIENT_ID = "32b9b1cb-79f4-44a0-80b3-070d837667c6";
    const CLIENT_SECRET = process.env.PICPAY_PRODUCTION_SECRET;

    console.log("🔑 Status das credenciais:", {
      clientId: CLIENT_ID ? "CONFIGURADO" : "FALTANDO",
      clientSecret: CLIENT_SECRET ? "CONFIGURADO" : "FALTANDO"
    });

    if (!CLIENT_SECRET) {
      throw new Error("❌ Configure PICPAY_PRODUCTION_SECRET no Netlify!");
    }

    const auth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
    const descricao = tipo === "vídeo" ? "Mensagem em Vídeo Surpresa" : "Mensagem em Áudio Surpresa";

    console.log("🔄 Chamando API PicPay...");

    const response = await axios.post('https://api.picpay.com/payment-links', {
      amount: Number(valor),
      description: descricao,
      return_url: "https://deixacomigoweb.netlify.app/sucesso",
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      max_orders: 1
    }, {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: 10000
    });

    console.log("🎉 SUCESSO! Resposta:", response.data);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        paymentLink: response.data.payment_url,
        id: response.data.id,
        message: "Link de pagamento criado com sucesso!"
      })
    };

  } catch (error) {
    console.error("💥 ERRO PICPAY:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });

    // ❌ AGORA SEM FALLBACK - APENAS ERRO DIRETO
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: "Falha no PicPay: " + (error.response?.data?.message || error.message),
        solution: "Configure PICPAY_PRODUCTION_SECRET no Netlify com o Client Secret real"
      })
    };
  }
};
