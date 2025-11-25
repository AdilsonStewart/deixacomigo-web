// netlify/functions/criar-pagamento-asaas.js
exports.handler = async (event) => {
  const headers = { 
    "Access-Control-Allow-Origin": "*", 
    "Content-Type": "application/json" 
  };

  try {
    const { valor, tipo, metodo } = JSON.parse(event.body || "{}");
    
    // ✅ POR ENQUANTO SÓ SIMULAMOS CARTÃO
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: `Cartão simulado para ${tipo} - R$ ${valor}`,
        checkoutUrl: "https://asaas.com/checkout/simulado", // URL simulada
        id: "cartao_" + Date.now()
      })
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        success: false, 
        erro: error.message 
      })
    };
  }
};
