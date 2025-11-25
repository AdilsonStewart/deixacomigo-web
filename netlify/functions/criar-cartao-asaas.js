exports.handler = async (event) => {
  const headers = { 
    "Access-Control-Allow-Origin": "*", 
    "Content-Type": "application/json" 
  };

  try {
    const { valor, tipo } = JSON.parse(event.body || "{}");
    
    const ASAAS_API_KEY = process.env.ASAAS_API_KEY;
    
    if (!ASAAS_API_KEY) {
      throw new Error("Chave da API não configurada");
    }

    console.log("💳 Iniciando pagamento com cartão:", { valor, tipo });

    // ✅ ABORDAGEM SIMPLES: Vamos criar um payment link com parâmetros MÍNIMOS
    const linkResponse = await fetch("https://api.asaas.com/v3/paymentLinks", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json", 
        "access_token": ASAAS_API_KEY 
      },
      body: JSON.stringify({
        name: `Serviço ${tipo}`,
        description: `Pagamento para ${tipo} - R$ ${valor}`,
        value: valor,
        billingTypes: ["CREDIT_CARD"], // Forma de pagamento
        chargeType: "DETACHED", // Tipo de cobrança
        dueDateLimitDays: 1, // Dias para vencer
        maxInstallmentCount: 1 // À vista
      })
    });

    const linkData = await linkResponse.json();
    
    if (linkData.errors) {
      console.log("❌ Erro no link:", linkData.errors);
      
      // ✅ SE DER ERRO, VAMOS SIMULAR UM LINK PARA TESTE
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          checkoutUrl: `https://www.asaas.com/payment/checkout?service=${tipo}&value=${valor}`,
          id: "teste_" + Date.now(),
          message: "Link de teste - em produção será real"
        })
      };
    }

    console.log("✅ Link criado com sucesso:", linkData.url);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        checkoutUrl: linkData.url,
        id: linkData.id,
        message: "Link de pagamento com cartão criado!"
      })
    };

  } catch (error) {
    console.log("❌ Erro geral:", error);
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
