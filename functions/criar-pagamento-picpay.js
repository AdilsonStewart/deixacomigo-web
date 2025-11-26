const axios = require('axios');

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json"
  };

  console.log("🔔 TESTE COM TOKEN ANTIGO + API CORRETA");

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

    // ✅ TENTA O TOKEN ANTIGO (que era para Gateway)
    const PICPAY_TOKEN = process.env.PICPAY_TOKEN; // O token antigo
    const descricao = tipo === "vídeo" ? "Mensagem em Vídeo Surpresa" : "Mensagem em Áudio Surpresa";

    console.log("🔄 Testando token antigo na API Gateway...");

    const response = await axios.post('https://appws.picpay.com/ecommerce/public/payments', {
      referenceId: `test-${Date.now()}`,
      callbackUrl: "https://deixacomigoweb.netlify.app/sucesso",
      returnUrl: "https://deixacomigoweb.netlify.app/sucesso",
      value: Number(valor),
      description: descricao,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      buyer: {
        firstName: "Cliente",
        lastName: "Teste",
        document: "123.456.789-09",
        email: "cliente@teste.com",
        phone: "+55-11-99999-9999"
      }
    }, {
      headers: {
        'x-picpay-token': PICPAY_TOKEN, // Token do Gateway
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    console.log("✅ FUNCIONOU com token antigo!");
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        paymentUrl: response.data.paymentUrl,
        qrcode: response.data.qrcode,
        message: "Funcionou com token do Gateway!"
      })
    };

  } catch (error) {
    console.error("❌ Também falhou:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });

    // ✅ SE NADA FUNCIONAR, VAMOS USAR UMA ABORDAGEM TOTALMENTE DIFERENTE
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: false,
        error: "TODAS TENTATIVAS FALHARAM",
        ultima_sugestao: "Vamos usar uma solução SEM PicPay? Posso ajudar com:",
        opcoes: [
          "1. WhatsApp para pedidos + Pagamento manual",
          "2. Outro gateway de pagamento", 
          "3. Sistema de agendamento sem pagamento online"
        ]
      })
    };
  }
};
