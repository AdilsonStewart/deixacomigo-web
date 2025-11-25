exports.handler = async (event) => {
  const headers = { 
    "Access-Control-Allow-Origin": "*", 
    "Content-Type": "application/json" 
  };

  try {
    const { valor, tipo, metodo } = JSON.parse(event.body || "{}");
    
    console.log("🔍 DEBUG: Iniciando pagamento", { valor, tipo, metodo });
    
    const ASAAS_API_KEY = process.env.ASAAS_API_KEY;
    
    if (!ASAAS_API_KEY) {
      throw new Error("Chave da API não configurada");
    }

    // 1. Criar cliente
    const clienteResponse = await fetch("https://api.asaas.com/v3/customers", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json", 
        "access_token": ASAAS_API_KEY 
      },
      body: JSON.stringify({ 
        name: `Cliente-${Date.now()}`,
        cpfCnpj: "04616557802",
        notificationDisabled: true
      })
    });

    const cliente = await clienteResponse.json();
    console.log("🔍 DEBUG: Cliente criado", cliente);
    
    if (cliente.errors) {
      throw new Error(`Erro ao criar cliente: ${JSON.stringify(cliente.errors)}`);
    }

    // 2. Criar pagamento
    const dataVencimento = new Date();
    dataVencimento.setMinutes(dataVencimento.getMinutes() + 30);

    let billingType = "PIX";
    if (metodo === 'cartao') {
      billingType = "CREDIT_CARD";
    }

    const pagamentoBody = {
      customer: cliente.id,
      billingType: billingType,
      value: valor,
      dueDate: dataVencimento.toISOString().split('T')[0],
      description: `Serviço ${tipo}`
    };

    console.log("🔍 DEBUG: Criando pagamento", pagamentoBody);

    const pagamentoResponse = await fetch("https://api.asaas.com/v3/payments", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json", 
        "access_token": ASAAS_API_KEY 
      },
      body: JSON.stringify(pagamentoBody)
    });

    const pagamento = await pagamentoResponse.json();
    console.log("🔍 DEBUG: Pagamento criado", pagamento);
    
    if (pagamento.errors) {
      throw new Error(`Erro no pagamento: ${JSON.stringify(pagamento.errors)}`);
    }

    // 3. Preparar resposta
    let responseData = {
      success: true,
      id: pagamento.id
    };

    if (metodo === 'pix') {
      // Buscar QR Code para PIX
      const pixResponse = await fetch(`https://api.asaas.com/v3/payments/${pagamento.id}/pixQrCode`, {
        method: "GET",
        headers: { 
          "Content-Type": "application/json", 
          "access_token": ASAAS_API_KEY 
        }
      });

      const pixData = await pixResponse.json();
      responseData.copiaECola = pixData.payload;
      responseData.qrCodeUrl = pixData.encodedImage ? `data:image/png;base64,${pixData.encodedImage}` : null;
    
    } else if (metodo === 'cartao') {
      // ✅ PARA CARTAO: A URL correta é esta:
      responseData.checkoutUrl = `https://www.asaas.com/c/${pagamento.id}`;
      console.log("🔍 DEBUG: URL do checkout", responseData.checkoutUrl);
    }

    console.log("🔍 DEBUG: Resposta final", responseData);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(responseData)
    };

  } catch (error) {
    console.log("❌ ERRO:", error);
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
