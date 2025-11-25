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

    // 1. Criar cliente
    const clienteResponse = await fetch("https://api.asaas.com/v3/customers", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json", 
        "access_token": ASAAS_API_KEY 
      },
      body: JSON.stringify({ 
        name: `Cliente-Cartao-${Date.now()}`,
        cpfCnpj: "04616557802",
        notificationDisabled: true
      })
    });

    const cliente = await clienteResponse.json();
    
    if (cliente.errors) {
      throw new Error(`Erro ao criar cliente: ${JSON.stringify(cliente.errors)}`);
    }

    // 2. Criar LINK DE PAGAMENTO para cartão
    const linkResponse = await fetch("https://api.asaas.com/v3/paymentLinks", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json", 
        "access_token": ASAAS_API_KEY 
      },
      body: JSON.stringify({
        name: `Serviço ${tipo} - R$ ${valor}`,
        description: `Pagamento para serviço de ${tipo} via cartão`,
        value: valor,
        billingTypes: ["CREDIT_CARD"], // Só cartão
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 dia
        maxInstallmentCount: 1 // À vista
      })
    });

    const linkData = await linkResponse.json();
    
    if (linkData.errors) {
      console.log("❌ Erro no link:", linkData.errors);
      throw new Error(`Erro ao criar link de pagamento: ${JSON.stringify(linkData.errors)}`);
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
