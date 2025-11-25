const axios = require('axios');

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json"
  };

  try {
    const PICPAY_TOKEN = process.env.PICPAY_TOKEN;
    
    console.log("🔍 Testando token:", PICPAY_TOKEN);

    // Tenta fazer uma requisição simples
    const response = await axios.get('https://appws.picpay.com/ecommerce/public/orders', {
      headers: {
        'x-picpay-token': PICPAY_TOKEN
      }
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: "Token VÁLIDO!",
        data: response.data
      })
    };

  } catch (error) {
    console.error("❌ Token inválido:", error.response?.data || error.message);
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({
        success: false,
        error: "Token inválido ou conta não configurada",
        details: error.response?.data || error.message
      })
    };
  }
};
