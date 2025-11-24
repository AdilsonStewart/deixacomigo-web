exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json"
  };

  if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers, body: "" };
  if (event.httpMethod !== "POST") return { statusCode: 405, headers, body: JSON.stringify({erro:"Só POST"}) };

  const { valor, tipo } = JSON.parse(event.body || "{}");

  // TROQUE SÓ AQUI PELA SUA CHAVE SANDBOX DO ASAAS (copie com botão)
  const key = "$aact_COLOQUE_SUA_CHAVE_SANDBOX_AQUI";

  try {
    const c = await fetch("https://api.asaas.com/v3/customers", {
      method: "POST", headers: { "content-type": "application/json", access_token: key },
      body: JSON.stringify({ name: "Pix", cpfCnpj: "24994055093", mobilePhone: "47999999999" })
    }).then(r => r.json());

    const p = await fetch("https://api.asaas.com/v3/payments", {
      method: "POST", headers: { "content-type": "application/json", access_token: key },
      body: JSON.stringify({
        customer: c.id, billingType: "PIX", value: valor,
        dueDate: new Date(Date.now()+10*60*1000).toISOString().split("T")[0],
        description: tipo
      })
    }).then(r => r.json());

    const qr = await fetch(`https://api.asaas.com/v3/payments/${p.id}/pixQrCode`, {
      headers: { access_token: key }
    }).then(r => r.json());

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        qrCodeUrl: qr.qrCodeUrl,
        copiaECola: qr.payload,
        paymentId: p.id
      })
    };
  } catch (e) {
    return { statusCode: 500, headers, body: JSON.stringify({ success: false, erro: e.message }) };
  }
};
