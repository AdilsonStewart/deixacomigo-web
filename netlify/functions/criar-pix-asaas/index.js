exports.handler = async (event) => {
  const headers = { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" };

  if (event.httpMethod !== "POST") return { statusCode: 405, headers, body: "Só POST" };

  const { valor, tipo } = JSON.parse(event.body || "{}");

  // SUA CHAVE (com aspas!!)
  const key = $aact_prod_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OjgzNzYzNWUxLWI4MzItNDMyYi04YTU1LTVkN2UxYmI4MWYzODo6JGFhY2hfNzU2M2JhY2QtMDgyMS00ZWE2LWEzZDYtNmUwYWE1MjU0ODlh;

  try {
    // 1. cria cliente
    const cliente = await fetch("https://api.asaas.com/v3/customers", {
      method: "POST",
      headers: { "content-type": "application/json", access_token: key },
      body: JSON.stringify({ name: "Teste", cpfCnpj: "24994055093", mobilePhone: "47999999999" })
    }).then(r => r.json());

    // 2. cria pagamento e já pega o QR Code direto
    const pagamento = await fetch("https://api.asaas.com/v3/payments", {
      method: "POST",
      headers: { "content-type": "application/json", access_token: key },
      body: JSON.stringify({
        customer: cliente.id,
        billingType: "PIX",
        value: valor,
        dueDate: new Date(Date.now() + 10*60*1000).toISOString().split("T")[0],
        description: tipo
      })
    }).then(r => r.json());

    // O QR Code já vem aqui direto na criação (sandbox funciona assim)
    const qrCodeUrl = pagamento.qrCodeUrl || pagamento.encodedImage ? `data:image/png;base64,${pagamento.encodedImage}` : "";

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        qrCodeUrl: qrCodeUrl,          // ← aparece na hora
        copiaECola: pagamento.payload || "brl123..." // às vezes vem, às vezes não
      })
    };
  } catch (e) {
    return { statusCode: 500, headers, body: JSON.stringify({ success: false, erro: e.message }) };
  }
};
