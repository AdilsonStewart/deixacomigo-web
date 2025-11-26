const axios = require('axios');

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json"
  };

  console.log("🔔 INVESTIGAÇÃO PICPAY - Passo a Passo");

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

    const CLIENT_ID = process.env.PICPAY_CLIENT_ID;
    const CLIENT_SECRET = process.env.PICPAY_CLIENT_SECRET;

    console.log("🔑 Credenciais:", {
      clientId: CLIENT_ID ? "EXISTE" : "FALTA",
      clientSecret: CLIENT_SECRET ? "EXISTE" : "FALTA"
    });

    // ✅ TENTATIVA 1: API com autenticação Basic (mais comum)
    const auth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
    const descricao = tipo === "vídeo" ? "Mensagem em Vídeo Surpresa" : "Mensagem em Áudio Surpresa";

    console.log("🔄 Tentando com headers completos...");

    const response = await axios.post('https://api.picpay.com/payment-links', {
      amount: Number(valor),
      description: descricao,
      return_url: "https://deixacomigoweb.netlify.app/sucesso",
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 1 dia
      max_orders: 1
    }, {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'DeixaComigo/1.0'
      },
      timeout: 15000
    });

    console.log("🎉 SUCESSO! Resposta:", response.data);
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
    console.error("💥 ERRO DETALHADO:", {
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      data: error.response?.data,
      headers: error.response?.headers
    });

    // ✅ SE DER ERRO, VAMOS TENTAR CONTATAR O SUPORTE DO PICPAY
    const mensagemSuporte = `
Problema: Credenciais Sandbox do Link de Pagamento API não funcionam.
Client ID: ${process.env.PICPAY_CLIENT_ID}
Erro: ${error.response?.data?.message || error.message}
Status: ${error.response?.status}

Já tentei:
- URL: https://api.picpay.com/payment-links
- Autenticação Basic
- Headers completos
- Diferentes formatos de payload

Minha conta está ativa e recebendo pagamentos via links manuais.
`;

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: "Falha na API PicPay",
        nextSteps: [
          "1. Contate o suporte do PicPay com esta mensagem:",
          mensagemSuporte,
          "2. Peça para ativarem sua API Sandbox",
          "3. Ou pegue a URL correta do Sandbox"
        ]
      })
    };
  }
};
