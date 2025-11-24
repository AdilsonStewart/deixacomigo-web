exports.handler = async (event) => {
  const { valor, tipo } = JSON.parse(event.body || "{}");

  // COLE AQUI SUA CHAVE SANDBOX (botão copiar do Asaas)
  const key = $aact_prod_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OjgzNzYzNWUxLWI4MzItNDMyYi04YTU1LTVkN2UxYmI4MWYzODo6JGFhY2hfNzU2M2JhY2QtMDgyMS00ZWE2LWEzZDYtNmUwYWE1MjU0ODlh;

  try {
    const c = await fetch("https://api.asaas.com/v3/customers", {
      method: "POST",
      headers: { "content-type": "application/json", access_token: key },
      body: JSON.stringify({ name: "Pix", cpfCnpj: "24994055093", mobilePhone: "47999999999" })
    }).then(r => r.json());

    const p = await fetch("https://api.asaas.com/v3/payments", {
      method: "POST",
      headers: { "content-type": "application/json", access_token: key },
      body: JSON.stringify({
        customer: c.id,
        billingType: "PIX",
        value: valor,
        dueDate: new Date(Date.now() + 10*60*1000).toISOString().split("T")[0],
        description: tipo
      })
    }).then(r => r.json());

    const qr = await fetch(`https://api.asaas.com/v3/payments/${p.id}/pixQrCode`, {
      headers: { access_token: key }
    }).then(r => r.json());

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        qrCodeUrl: qr.qrCodeUrl,
        copiaECola: qr.payload,
        paymentId: p.id
      })
    };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ success: false, erro: e.message }) };
  }
};
