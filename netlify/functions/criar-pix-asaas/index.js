exports.handler = async (event) => {
  const headers = { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" };

  if (event.httpMethod !== "POST") return { statusCode: 405, headers, body: "Só POST" };

  const { valor, tipo } = JSON.parse(event.body || "{}");

  // ←←← SUA CHAVE SANDBOX AQUI (copia com o botão do Asaas)
  const key = "$aact_COLOQUE_SUA_CHAVE_SANDBOX_AQUI";

  try {
    // 1. cria cliente
    const cliente = await fetch("https://api.asaas.com/v3/customers", {
      method: "POST",
      headers: { "content-type": "application/json", access_token: key },
      body: JSON.stringify({ name: "Cliente", cpfCnpj: "24994055093", mobilePhone: "47999999999" })
    }).then(r => r.json());

    // 2. cria pagamento PIX
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

    // 3. pega o QR Code (Asaas manda encodedImage + payload)
    const qr = await fetch(`https://api.asaas.com/v3/payments/${pagamento.id}/pixQrCode`, {
      headers: { access_token: key }
    }).then(r => r.json());

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        qrCodeUrl: `data:image/png;base64,${qr.encodedImage}`,   // ← imagem base64
        copiaECola: qr.payload                                   // ← código copia-e-cola
      })
    };
  } catch (e) {
    return { statusCode: 500, headers, body: JSON.stringify({ success: false, erro: e.message }) };
  }
};
