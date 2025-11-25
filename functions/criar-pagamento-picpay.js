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
    const { valor, tipo, metodo = "pix" } = body;

    if (!valor || !tipo) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, error: "Faltou valor ou tipo" })
      };
    }

    console.log("✅ Dados recebidos:", { valor, tipo, metodo });

    // ✅ PICPAY - Criar pedido de pagamento
    const descricao = tipo === "vídeo" ? "Mensagem em Vídeo Surpresa" : "Mensagem em Áudio Surpresa";
    
    const auth = Buffer.from(`${process.env.PICPAY_TOKEN}:${process.env.PICPAY_SECRET}`).toString('base64');

    const response = await axios.post('https://appws.picpay.com/ecommerce/public/payments', {
      referenceId: `surpresa-${Date.now()}`,
      callbackUrl: "https://deixacomigoweb.netlify.app/sucesso",
      returnUrl: "https://deixacomigoweb.netlify.app/sucesso",
      value: Number(valor),
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutos
      buyer: {
        firstName: "Cliente",
        lastName: "Teste",
        document: "04616557802",
        email: "cliente@teste.com",
        phone: "+5511999999999"
      }
    }, {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
        'x-picpay-token': process.env.PICPAY_TOKEN
      }
    });

    const data = response.data;

    console.log("✅ Pagamento criado com sucesso:", data.referenceId);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        paymentLink: data.paymentUrl, // ✅ URL do checkout PicPay
        qrCode: data.qrcode, // ✅ QR Code base64 (se tiver)
        id: data.referenceId
      })
    };

  } catch (error) {
    console.error("❌ Erro PicPay:", error.response?.data || error.message);
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
