exports.handler = async (event) => {
  const headers = { 
    "Access-Control-Allow-Origin": "*", 
    "Content-Type": "application/json" 
  };

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: JSON.stringify({ error: "Método não permitido" }) };
  }

  try {
    const { valor, tipo } = JSON.parse(event.body || "{}");
    
    // ✅ CHAVE POR VARIÁVEL DE AMBIENTE
    const ASAAS_API_KEY = process.env.ASAAS_API_KEY;
    
    if (!ASAAS_API_KEY) {
      throw new Error("Chave da API não configurada");
    }

    // 1. Criar cliente único (evita duplicação)
    const clienteResponse = await fetch("https://api.asaas.com/v3/customers", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json", 
        "access_token": ASAAS_API_KEY 
      },
      body: JSON.stringify({ 
        name: `Cliente-${Date.now()}`, // Nome único
        cpfCnpj: "249.940.550-93", // Formato correto
        notificationDisabled: true
      })
    });

    const cliente = await clienteResponse.json();
    
    if (cliente.errors) {
      throw new Error(`Erro ao criar cliente: ${JSON.stringify(cliente.errors)}`);
    }

    // 2. Criar pagamento PIX
    const dataVencimento = new Date();
    dataVencimento.setMinutes(dataVencimento.getMinutes() + 30); // 30 min para vencer

    const pagamentoResponse = await fetch("https://api.asaas.com/v3/payments", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json", 
        "access_token": ASAAS_API_KEY 
      },
      body: JSON.stringify({
        customer: cliente.id,
        billingType: "PIX",
        value: valor,
        dueDate: dataVencimento.toISOString().split('T')[0],
        description: `Serviço ${tipo}`,
        externalReference: `ref-${Date.now()}`
      })
    });

    const pagamento = await pagamentoResponse.json();
    
    if (pagamento.errors) {
      throw new Error(`Erro no pagamento: ${JSON.stringify(pagamento.errors)}`);
    }

    // 3. Buscar QR Code (passo adicional necessário)
    const pixResponse = await fetch(`https://api.asaas.com/v3/payments/${pagamento.id}/pixQrCode`, {
      method: "GET",
      headers: { 
        "Content-Type": "application/json", 
        "access_token": ASAAS_API_KEY 
      }
    });

    const pixData = await pixResponse.json();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        copiaECola: pixData.payload || pagamento.payload,
        qrCodeUrl: pixData.encodedImage ? `data:image/png;base64,${pixData.encodedImage}` : null,
        id: pagamento.id
      })
    };

  } catch (error) {
    console.error("Erro completo:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        success: false, 
        erro: error.message,
        detalhes: "Verifique console para mais informações"
      })
    };
  }
};
