const axios = require('axios');

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json"
  };

  console.log("🔔 Link de Pagamento PicPay - Iniciando");

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

    // ✅ CREDENCIAIS DO LINK DE PAGAMENTO
    const PICPAY_TOKEN = process.env.PICPAY_TOKEN; // Client Id
    const PICPAY_SECRET = process.env.PICPAY_SECRET; // Client Secret

    if (!PICPAY_TOKEN || !PICPAY_SECRET) {
      throw new Error("Credenciais não configuradas no servidor");
    }

    // Autenticação Basic para Link de Pagamento
    const auth = Buffer.from(`${PICPAY_TOKEN}:${PICPAY_SECRET}`).toString('base64');
    
    const descricao = tipo === "vídeo" ? "Mensagem em Vídeo Surpresa" : "Mensagem em Áudio Surpresa";

    console.log("🔄 Criando Link de Pagamento...");

    // ✅ API CORRETA DO LINK DE PAGAMENTO
    const response = await axios.post('https://app.picpay.com/payment-links', {
      amount: Number(valor),
      description: descricao,
      return_url: "https://deixacomigoweb.netlify.app/sucesso",
      expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutos
      max_orders: 1
    }, {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
        'User-Agent': 'PicPayNodeJS/1.0'
      },
      timeout: 10000
    });

    const data = response.data;
    console.log("✅ Link de Pagamento criado:", data.id);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        paymentLink: data.payment_url, // URL do link de pagamento
        id: data.id,
        message: "Link de pagamento criado com sucesso!"
      })
    };

  } catch (error) {
    console.error("❌ Erro detalhado:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      headers: error.response?.headers
    });

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: error.response?.data?.message || error.message,
        details: error.response?.data,
        statusCode: error.response?.status
      })
    };
  }
};
