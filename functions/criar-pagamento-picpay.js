const axios = require('axios');

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json"
  };

  console.log("🔔 Cora - Criando cobrança PIX");

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

    // Obter as credenciais da Cora do ambiente
    const CORA_CLIENT_ID = process.env.CORA_CLIENT_ID;
    const CORA_CLIENT_SECRET = process.env.CORA_CLIENT_SECRET;
    const CORA_ACCESS_TOKEN = process.env.CORA_ACCESS_TOKEN; // Se já tiver um token

    // Se não tivermos um access token, precisamos obter um
    let accessToken = CORA_ACCESS_TOKEN;
    if (!accessToken && CORA_CLIENT_ID && CORA_CLIENT_SECRET) {
      // Obter access token da Cora
      const tokenResponse = await axios.post('https://api.cora.com.br/oauth/token', {
        grant_type: 'client_credentials',
        client_id: CORA_CLIENT_ID,
        client_secret: CORA_CLIENT_SECRET
      }, {
        headers: { 'Content-Type': 'application/json' }
      });
      accessToken = tokenResponse.data.access_token;
    }

    if (!accessToken) {
      throw new Error("Não foi possível obter o access token da Cora. Verifique as credenciais.");
    }

    const descricao = tipo === "vídeo" ? "Mensagem em Vídeo Surpresa" : "Mensagem em Áudio Surpresa";

    console.log("🔄 Criando cobrança PIX na Cora...");

    // Criar a cobrança PIX
    const response = await axios.post('https://api.cora.com.br/v1/charges', {
      amount: Number(valor) * 100, // Em centavos
      description: descricao,
      payment_method: 'pix',
      expires_in: 1800, // 30 minutos em segundos
      metadata: {
        product_type: tipo,
        site: 'deixacomigo'
      }
    }, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    const data = response.data;
    console.log("✅ Cobrança Cora criada:", data);

    // A resposta da Cora deve incluir o QR code e outros dados de pagamento
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        paymentUrl: data.payment_url, // Se a Cora fornecer uma URL de pagamento
        qrcode: data.pix.qrcode, // Supondo que a resposta tenha um objeto pix com qrcode
        qrcodeText: data.pix.qrcode_text, // E texto do QR code
        id: data.id,
        message: "Cobrança PIX criada com sucesso!"
      })
    };

  } catch (error) {
    console.error("❌ Erro Cora:", {
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
