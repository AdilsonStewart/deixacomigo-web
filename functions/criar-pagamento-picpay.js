const axios = require('axios');

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json"
  };

  console.log("🔔 PicPay Link de Pagamento - Documentação Oficial");

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

    const CLIENT_ID = process.env.PICPAY_CLIENT_ID;
    const CLIENT_SECRET = process.env.PICPAY_CLIENT_SECRET;

    if (!CLIENT_ID || !CLIENT_SECRET) {
      throw new Error("Credenciais não configuradas");
    }

    const auth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
    const descricao = tipo === "vídeo" ? "Mensagem em Vídeo Surpresa" : "Mensagem em Áudio Surpresa";

    console.log("🔄 Criando Link de Pagamento...");

    // ✅ BASEADO NA DOCUMENTAÇÃO PICPAY
    const response = await axios.post('https://api.picpay.com/payment-links', {
      amount: Number(valor),
      description: descricao,
      return_url: "https://deixacomigoweb.netlify.app/sucesso",
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      max_orders: 1
    }, {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: 10000
    });

    const data = response.data;
    console.log("✅ Link criado:", data);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        paymentLink: data.payment_url,
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

    // Se der erro 404, a URL pode ser diferente no Sandbox
    if (error.response?.status === 404) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          success: false,
          error: "URL da API não encontrada. O Sandbox pode usar URL diferente.",
          suggestion: "Verifique na documentação se há URL específica para Sandbox"
        })
      };
    }

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
