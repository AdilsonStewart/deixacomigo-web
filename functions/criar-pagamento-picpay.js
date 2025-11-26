const axios = require('axios');

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json"
  };

  console.log("🔔 Function iniciada - TESTE DETALHADO");

  try {
    // Verifica se recebeu dados
    console.log("📦 Body recebido:", event.body);
    
    const body = JSON.parse(event.body || "{}");
    const { valor, tipo } = body;

    console.log("✅ Dados extraídos:", { valor, tipo });

    if (!valor || !tipo) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, error: "Faltou valor ou tipo" })
      };
    }

    // Credenciais Sandbox
    const CLIENT_ID = "6946f24e-b411-4a3c-8fdc-2b3c5903c0b5";
    const CLIENT_SECRET = "yxKuRc9T87Q6MAvfgeItWQEpAXmRNzXA";

    console.log("🔑 Credenciais preparadas");

    const auth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
    const descricao = tipo === "vídeo" ? "Mensagem em Vídeo Surpresa" : "Mensagem em Áudio Surpresa";

    console.log("🔄 Chamando API PicPay...");

    // Tentativa com API
    const response = await axios.post('https://api.picpay.com/payment-links', {
      amount: Number(valor),
      description: descricao,
      return_url: "https://deixacomigoweb.netlify.app/sucesso",
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      max_orders: 1
    }, {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    console.log("✅ Resposta da API:", response.data);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        paymentLink: response.data.payment_url,
        id: response.data.id,
        message: "Funcionou!"
      })
    };

  } catch (error) {
    console.error("💥 ERRO COMPLETO:");
    console.error("Mensagem:", error.message);
    console.error("Status:", error.response?.status);
    console.error("Dados:", error.response?.data);
    console.error("URL:", error.config?.url);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: error.response?.data?.message || error.message,
        details: error.response?.data,
        step: "Verifique as credenciais Sandbox"
      })
    };
  }
};
