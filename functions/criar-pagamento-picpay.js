const axios = require('axios');

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json"
  };

  console.log("🔔 TESTANDO TODAS URLS POSSÍVEIS");

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

    // ✅ LISTA DE URLS POSSÍVEIS PARA SANDBOX
    const urlsToTest = [
      'https://sandbox.picpay.com/payment-links',
      'https://api.sandbox.picpay.com/payment-links',
      'https://sandbox-api.picpay.com/payment-links',
      'https://staging.picpay.com/payment-links',
      'https://api.staging.picpay.com/payment-links'
    ];

    console.log(`🔄 Testando ${urlsToTest.length} URLs...`);

    for (let i = 0; i < urlsToTest.length; i++) {
      const url = urlsToTest[i];
      console.log(`📡 Tentando URL ${i + 1}: ${url}`);
      
      try {
        const response = await axios.post(url, {
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
          timeout: 5000
        });

        console.log(`🎉 SUCESSO com URL: ${url}`);
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            paymentLink: response.data.payment_url,
            id: response.data.id,
            workingUrl: url,
            message: "URL encontrada!"
          })
        };

      } catch (error) {
        console.log(`❌ URL ${url} falhou: ${error.response?.status || error.message}`);
        // Continua para a próxima URL
      }
    }

    // Se nenhuma URL funcionou
    throw new Error("Nenhuma URL Sandbox funcionou. Verifique a documentação.");

  } catch (error) {
    console.error("💥 TODAS URLS FALHARAM:", error.message);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: error.message,
        suggestion: "NA DOCUMENTAÇÃO, procure por 'Sandbox URL' ou 'Testing environment'"
      })
    };
  }
};
