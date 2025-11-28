exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json",
  };

  try {
    const body = JSON.parse(event.body || "{}");
    const valor = body.valor || 5.00;

    const ASAAS_API_KEY = process.env.ASAAS_API_KEY;
    if (!ASAAS_API_KEY) throw new Error("Chave Asaas não configurada");

    const asaasHeaders = {
      "access_token": ASAAS_API_KEY,
      "Content-Type": "application/json",
    };

    // 1 – cria cliente
    const cliente = await fetch("https://sandbox.asaas.com/api/v3/customers", {
      method: "POST",
      headers: asaasHeaders,
      body: JSON.stringify({
        name: "Cliente Teste",
        cpfCnpj: "04616557802",
      }),
    }).then(r => r.json());

    if (cliente.errors) throw new Error(cliente.errors[0].description);

    // 2 – cria pagamento PIX
    const pagamento = await fetch("https://sandbox.asaas.com/api/v3/payments", {
      method: "POST",
      headers: asaasHeaders,
      body: JSON.stringify({
        customer: cliente.id,
        billingType: "PIX",
        value: Number(valor).toFixed(2),
        dueDate: new Date(Date.now() + 3*24*60*60*1000).toISOString().split("T")[0],
        description: "DeixaComigo teste",
      }),
    }).then(r => r.json());

    if (pagamento.errors) throw new Error(pagamento.errors[0].description);

    // 3 – pega QR Code
    const qr = await fetch(`https://sandbox.asaas.com/api/v3/payments/${pagamento.id}/pixQrCode`, {
      headers: asaasHeaders,
    }).then(r => r.json());

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        qrCodeBase64: qr.encodedImage,
        copiaECola: qr.payload,
      }),
    };

  } catch (erro) {
    console.error("Erro:", erro.message);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, error: erro.message }),
    };
  }
};
