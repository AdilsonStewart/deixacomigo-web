exports.handler = async (event) => {
  const headers = { 
    "Access-Control-Allow-Origin": "*", 
    "Content-Type": "application/json" 
  };

  try {
    console.log("=== INICIANDO DEBUG ===");
    
    // Verifica se a variável existe
    const ASAAS_API_KEY = process.env.ASAAS_APIKEY;
    console.log("Variável carregada:", !!ASAAS_API_KEY);
    console.log("Tipo da variável:", typeof ASAAS_API_KEY);
    
    if (ASAAS_API_KEY) {
      console.log("Primeiros 10 chars:", ASAAS_API_KEY.substring(0, 10));
      console.log("Últimos 10 chars:", ASAAS_API_KEY.substring(ASAAS_API_KEY.length - 10));
    }

    // Teste SIMPLES com a API
    if (ASAAS_API_KEY) {
      const testResponse = await fetch("https://api.asaas.com/v3/finance/balance", {
        method: "GET",
        headers: { 
          "Content-Type": "application/json", 
          "access_token": ASAAS_API_KEY 
        }
      });
      
      console.log("Status do teste:", testResponse.status);
      const testResult = await testResponse.json();
      console.log("Resposta do teste:", JSON.stringify(testResult));
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        debug: {
          variavelExiste: !!ASAAS_API_KEY,
          tipo: typeof ASAAS_API_KEY,
          primeirosChars: ASAAS_API_KEY ? ASAAS_API_KEY.substring(0, 10) : "n/a",
          testeCompleto: "Ver logs do Netlify"
        }
      })
    };

  } catch (error) {
    console.error("Erro no debug:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        success: false, 
        erro: error.message,
        stack: error.stack
      })
    };
  }
};
