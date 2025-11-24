exports.handler = async (event) => {
  const headers = { 
    "Access-Control-Allow-Origin": "*", 
    "Content-Type": "application/json" 
  };

  try {
    // Só para debug - vamos ver a chave
    const ASAAS_API_KEY = process.env.ASAAS_API_KEY;
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        debug: {
          chaveExiste: !!ASAAS_API_KEY,
          primeiros10: ASAAS_API_KEY ? ASAAS_API_KEY.substring(0, 10) : "nada",
          comprimento: ASAAS_API_KEY ? ASAAS_API_KEY.length : 0
        }
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
