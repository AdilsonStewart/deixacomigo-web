const axios = require('axios');

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json"
  };

  console.log("🚀 SISTEMA PICPAY PRODUÇÃO - BOTÕES FUNCIONANDO");

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

    // ✅ CREDENCIAIS DE PRODUÇÃO
    const CLIENT_ID = "32b9b1cb-79f4-44a0-80b3-070d837667c6";
    const CLIENT_SECRET = process.env.PICPAY_PRODUCTION_SECRET; // ⚠️ CONFIGURAR NO NETLIFY!

    if (!CLIENT_SECRET) {
      throw new Error("Client Secret de produção não configurado");
    }

    const auth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
    const descricao = tipo === "vídeo" ? "Mensagem em Vídeo Surpresa" : "Mensagem em Áudio Surpresa";

    console.log("🔄 Criando link de pagamento REAL...");

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

    console.log("🎉 LINK DE PAGAMENTO REAL CRIADO:", response.data);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        paymentLink: response.data.payment_url,
        id: response.data.id,
        message: "Pagamento criado com sucesso!",
        environment: "PRODUÇÃO"
      })
    };

  } catch (error) {
    console.error("❌ Erro produção:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });

    // ✅ FALLBACK AUTOMÁTICO - NUNCA FICA FORA DO AR
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        paymentLink: `https://wa.me/5511999999999?text=Olá! Quero: ${tipo} por R$ ${valor}`,
        message: "Sistema automático em ajuste. Entre em contato pelo WhatsApp!",
        fallback: true
      })
    };
  }
};
