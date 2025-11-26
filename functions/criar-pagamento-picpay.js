const axios = require('axios');

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json"
  };

  console.log("🔔 BUSCA DA URL CORRETA DO PICPAY SANDBOX");

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
    const auth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
    const descricao = tipo === "vídeo" ? "Mensagem em Vídeo Surpresa" : "Mensagem em Áudio Surpresa";

    // ✅ LISTA COMPLETA DE URLs POSSÍVEIS PARA SANDBOX
    const urlTests = [
      // Padrões comuns de Sandbox
      { url: 'https://sandbox-api.picpay.com/payment-links', name: 'sandbox-api' },
      { url: 'https://api.sandbox.picpay.com/payment-links', name: 'api.sandbox' },
      { url: 'https://sandbox.picpay.com/api/payment-links', name: 'sandbox + api path' },
      { url: 'https://staging-api.picpay.com/payment-links', name: 'staging-api' },
      { url: 'https://api.staging.picpay.com/payment-links', name: 'api.staging' },
      { url: 'https://developers.picpay.com/payment-links', name: 'developers' },
      { url: 'https://api-dev.picpay.com/payment-links', name: 'api-dev' },
      
      // URLs de produção (às vezes Sandbox usa as mesmas com credenciais diferentes)
      { url: 'https://api.picpay.com/payment-links', name: 'api production' },
      { url: 'https://app.picpay.com/api/payment-links', name: 'app + api path' },
      { url: 'https://picpay.com/api/payment-links', name: 'domain + api path' },
      
      // Tentativas com paths diferentes
      { url: 'https://api.picpay.com/v1/payment-links', name: 'api + v1' },
      { url: 'https://api.picpay.com/v2/payment-links', name: 'api + v2' },
      { url: 'https://api.picpay.com/payment_links', name: 'with underscore' },
      { url: 'https://api.picpay.com/payment/links', name: 'payment/links' },
    ];

    console.log(`🎯 Testando ${urlTests.length} URLs possíveis...`);

    for (const test of urlTests) {
      console.log(`🔍 Tentando: ${test.name} (${test.url})`);
      
      try {
        const response = await axios.post(test.url, {
          amount: Number(valor),
          description: descricao,
          return_url: "https://deixacomigoweb.netlify.app/sucesso",
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          max_orders: 1
        }, {
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          timeout: 3000
        });

        // ✅ SE CHEGOU AQUI, ENCONTRAMOS A URL CORRETA!
        console.log(`🎉 🎉 🎉 URL ENCONTRADA: ${test.url} 🎉 🎉 🎉`);
        console.log("Resposta:", response.data);

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            paymentLink: response.data.payment_url || response.data.url,
            id: response.data.id,
            discoveredUrl: test.url,
            message: "URL CORRETA ENCONTRADA! Sistema funcionando!"
          })
        };

      } catch (error) {
        const status = error.response?.status;
        console.log(`❌ ${test.name}: ${status || error.code}`);
        
        // Se for um erro diferente de 404, pode ser que a URL exista mas há outro problema
        if (status && status !== 404) {
          console.log(`⚠️  ${test.name} retornou ${status} - URL pode existir!`);
        }
      }
    }

    // ❌ SE NENHUMA FUNCIONOU
    throw new Error(`Nenhuma das ${urlTests.length} URLs funcionou. O Sandbox do PicPay pode estar com problemas.`);

  } catch (error) {
    console.error("💥 Falha total:", error.message);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: error.message,
        ultimaAlternativa: [
          "1. Contatar suporte PicPay com as credenciais Sandbox",
          "2. Usar API de produção (se disponível)",
          "3. Implementar sistema híbrido temporário"
        ]
      })
    };
  }
};
