const axios = require('axios');

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json"
  };

  console.log("🔔 TESTE FINAL - Verificando o problema real");

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

    console.log("🔍 ANALISANDO CREDENCIAIS:", {
      clientId: CLIENT_ID ? `${CLIENT_ID.substring(0, 10)}...` : "NULL",
      clientSecret: CLIENT_SECRET ? `${CLIENT_SECRET.substring(0, 10)}...` : "NULL"
    });

    // ✅ TESTE: Talvez as credenciais Sandbox usem AUTENTICAÇÃO DIFERENTE
    const auth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');

    console.log("🔄 Testando com autenticação alternativa...");

    // Tentativa com autenticação Bearer (às vezes Sandbox usa isso)
    try {
      const response = await axios.post('https://api.picpay.com/payment-links', {
        amount: Number(valor),
        description: "Teste Sandbox",
        return_url: "https://deixacomigoweb.netlify.app/sucesso",
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        max_orders: 1
      }, {
        headers: {
          'Authorization': `Bearer ${CLIENT_ID}`, // ✅ Tenta Bearer token
          'Content-Type': 'application/json'
        },
        timeout: 5000
      });

      console.log("✅ FUNCIONOU com Bearer token!");
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          paymentLink: response.data.payment_url,
          message: "Funcionou com Bearer token!"
        })
      };

    } catch (bearerError) {
      console.log("❌ Bearer também falhou:", bearerError.response?.status);
      
      // ÚLTIMA TENTATIVA: Verificar se precisa ativar algo no PicPay
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: false,
          error: "Credenciais Sandbox não estão funcionando",
          solution: "Volte no PicPay e procure por:",
          steps: [
            "1. 'Ativar Sandbox' ou 'Habilitar teste'",
            "2. 'Aprovar credenciais de teste'", 
            "3. Botão 'Iniciar ambiente de desenvolvimento'",
            "4. Ou contate o suporte do PicPay sobre Sandbox"
          ]
        })
      };
    }

  } catch (error) {
    console.error("Erro geral:", error.message);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: error.message
      })
    };
  }
};
