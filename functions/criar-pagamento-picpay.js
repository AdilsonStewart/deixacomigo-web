const axios = require('axios');

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json"
  };

  console.log("🔔 Function iniciada");

  try {
    // Verifica método HTTP
    if (event.httpMethod !== "POST") {
      console.log("❌ Método não permitido:", event.httpMethod);
      return {
        statusCode: 405,
        headers,
        body: JSON.stringify({ success: false, error: "Método não permitido" })
      };
    }

    // Parse do body
    let body;
    try {
      body = JSON.parse(event.body || "{}");
    } catch (parseError) {
      console.log("❌ Erro ao parsear JSON:", parseError);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, error: "JSON inválido" })
      };
    }

    const { valor, tipo } = body;
    console.log("📦 Dados recebidos:", { valor, tipo });

    // Validação
    if (!valor || !tipo) {
      console.log("❌ Dados faltando:", { valor, tipo });
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, error: "Faltou valor ou tipo" })
      };
    }

    // Verifica variáveis de ambiente
    const PICPAY_TOKEN = process.env.PICPAY_TOKEN;
    const PICPAY_SECRET = process.env.PICPAY_SECRET;

    console.log("🔑 Variáveis de ambiente:", {
      hasToken: !!PICPAY_TOKEN,
      hasSecret: !!PICPAY_SECRET,
      tokenLength: PICPAY_TOKEN ? PICPAY_TOKEN.length : 0,
      secretLength: PICPAY_SECRET ? PICPAY_SECRET.length : 0
    });

    if (!PICPAY_TOKEN || !PICPAY_SECRET) {
      console.log("❌ Variáveis de ambiente faltando");
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ success: false, error: "Configuração do servidor incompleta" })
      };
    }

    // Cria autenticação
    const auth = Buffer.from(`${PICPAY_TOKEN}:${PICPAY_SECRET}`).toString('base64');
    const descricao = tipo === "vídeo" ? "Mensagem em Vídeo Surpresa" : "Mensagem em Áudio Surpresa";

    console.log("🔄 Chamando API PicPay...");

    // Chamada para PicPay
    const response = await axios.post('https://app.picpay.com/payment-links', {
      amount: Number(valor),
      description: descricao,
      return_url: "https://deixacomigoweb.netlify.app/sucesso",
      expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      max_orders: 1
    }, {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    console.log("✅ Resposta PicPay:", response.data);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        paymentLink: response.data.payment_url,
        id: response.data.id
      })
    };

  } catch (error) {
    console.error("💥 ERRO DETALHADO:");
    console.error("Mensagem:", error.message);
    console.error("Response:", error.response?.data);
    console.error("Status:", error.response?.status);
    console.error("Headers:", error.response?.headers);

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
