const axios = require('axios');

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json"
  };

  console.log("🔔 Function criar-pagamento-picpay chamada");

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

    // ✅ LINK DE PAGAMENTO PICPAY - Formato correto
    const descricao = tipo === "vídeo" ? "Mensagem em Vídeo Surpresa" : "Mensagem em Áudio Surpresa";
    
    const PICPAY_TOKEN = process.env.PICPAY_TOKEN;
    const PICPAY_SECRET = process.env.PICPAY_SECRET;

    // Autenticação Basic para Link de Pagamento
    const auth = Buffer.from(`${PICPAY_TOKEN}:${PICPAY_SECRET}`).toString('base64');

    const response = await axios.post('https://app.picpay.com/payment-links', {
      amount: Number(valor),
      description: descricao,
      return_url: "https://deixacomigoweb.netlify.app/sucesso",
      expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutos
      max_orders: 1
    }, {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      }
    });

    const data = response.data;

    console.log("✅ Link de pagamento criado com sucesso:", data.id);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        paymentLink: data.payment_url, // ✅ URL do Link de Pagamento
        id: data.id
      })
    };

  } catch (error) {
    console.error("❌ Erro PicPay Link:", error.response?.data || error.message);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: error.response?.data?.message || error.message
      })
    };
  }
};
