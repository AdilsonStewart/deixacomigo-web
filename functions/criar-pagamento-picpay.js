const axios = require('axios');

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json"
  };

  console.log("🔔 PicPay Sandbox - Testando URLs");

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

    console.log("🔑 Credenciais carregadas:", {
      hasClientId: !!CLIENT_ID,
      hasClientSecret: !!CLIENT_SECRET
    });

    if (!CLIENT_ID || !CLIENT_SECRET) {
      throw new Error("Credenciais não configuradas");
    }

    const auth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
    const descricao = tipo === "vídeo" ? "Mensagem em Vídeo Surpresa" : "Mensagem em Áudio Surpresa";

    console.log("🔄 Tentando URL 1: app.picpay.com...");

    // ✅ TENTATIVA 1 - URL ALTERNATIVA
    try {
      const response = await axios.post('https://app.picpay.com/payment-links', {
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

      console.log("✅ SUCESSO com app.picpay.com!");
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          paymentLink: response.data.payment_url,
          id: response.data.id
        })
      };

    } catch (error1) {
      console.log("❌ URL 1 falhou:", error1.message);
      
      // ✅ TENTATIVA 2 - OUTRA URL
      console.log("🔄 Tentando URL 2: appws.picpay.com...");
      try {
        const response2 = await axios.post('https://appws.picpay.com/ecommerce/public/payments', {
          referenceId: `test-${Date.now()}`,
          callbackUrl: "https://deixacomigoweb.netlify.app/sucesso",
          returnUrl: "https://deixacomigoweb.netlify.app/sucesso",
          value: Number(valor),
          description: descricao,
          expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
          buyer: {
            firstName: "Cliente",
            lastName: "Teste",
            document: "123.456.789-09"
          }
        }, {
          headers: {
            'x-picpay-token': CLIENT_ID, // Para essa API usa token direto
            'Content-Type': 'application/json'
          },
          timeout: 5000
        });

        console.log("✅ SUCESSO com appws.picpay.com!");
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            paymentUrl: response2.data.paymentUrl,
            qrcode: response2.data.qrcode
          })
        };

      } catch (error2) {
        console.log("❌ URL 2 também falhou:", error2.message);
        throw new Error(`Ambas URLs falharam: ${error1.message} | ${error2.message}`);
      }
    }

  } catch (error) {
    console.error("💥 TODAS TENTATIVAS FALHARAM:", error.message);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: error.message,
        suggestion: "Verifique a URL correta na documentação do PicPay Sandbox"
      })
    };
  }
};
