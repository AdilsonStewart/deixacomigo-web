exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "POST only" };

  const { valor, tipo } = JSON.parse(event.body || "{}");

  // COLE AQUI SUA CHAVE SANDBOX DO ASAAS (copie com o botão, sem espaço)
  const ASAAS_KEY = $aact_prod_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OjgzNzYzNWUxLWI4MzItNDMyYi04YTU1LTVkN2UxYmI4MWYzODo6JGFhY2hfNzU2M2JhY2QtMDgyMS00ZWE2LWEzZDYtNmUwYWE1MjU0ODlh;

  try {
    // 1. cria cliente
    const cliente = await fetch("https://api.asaas.com/v3/customers", {
      method: "POST",
      headers: { "content-type": "application/json", access_token: ASAAS_KEY },
      body: JSON.stringify({ name: "Cliente", cpfCnpj: "24994055093", mobilePhone: "47999999999" })
    }).then(r => r.json());

    // 2. cria pix
    const pagamento = await fetch("https://api.asaas.com/v3/payments", {
      method: "POST",
      headers: { "content-type": "application/json", access_token: ASAAS_KEY },
      body: JSON.stringify({
        customer: cliente.id,
        billingType: "PIX",
        value: valor,
        dueDate: new Date(Date.now() + 15*60*1000).toISOString().split("T")[0],
        description: `Lembrete ${tipo}`
      })
    }).then(r => r.json());

    // 3. pega QR Code
    const qr = await fetch(`https://api.asaas.com/v3/payments/${pagamento.id}/pixQrCode`, {
      headers: { access_token: ASAAS_KEY }
    }).then(r => r.json());

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        qrCodeUrl: qr.qrCodeUrl,
        copiaECola: qr.payload,
        paymentId: pagamento.id
      })
    };
  } catch (e) {
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, erro: e.message })
    };
  }
};
