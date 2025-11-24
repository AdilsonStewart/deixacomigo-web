exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "POST only" };
  }

  const { valor, tipo } = JSON.parse(event.body || "{}");

  // TROQUE SÓ ISSO PELA SUA CHAVE SANDBOX (copie com o botão do Asaas)
  const key = "$aact_COLOQUE_SUA_CHAVE_SANDBOX_AQUI";

  try {
    // Cria cliente
    const clienteRes = await fetch("https://api.asaas.com/v3/customers", {
      method: "POST",
      headers: { "Content-Type": "application/json", access_token: key },
      body: JSON.stringify({
        name: "Cliente Pix",
        cpfCnpj: "24994055093",
        mobilePhone: "47999999999"
      })
    });
    const cliente = await clienteRes.json();

    // Cria Pix
    const pagamentoRes = await fetch("https://api.asaas.com/v3/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json", access_token: key },
      body: JSON.stringify({
        customer: cliente.id,
        billingType: "PIX",
        value: valor,
        dueDate: new Date(Date.now() + 15 * 60 * 1000).toISOString().split("T")[0],
        description: `Lembrete ${tipo}`
      })
    });
    const pagamento = await pagamentoRes.json();

    // Pega QR Code
    const qrRes = await fetch(`https://api.asaas.com/v3/payments/${pagamento.id}/pixQrCode`, {
      headers: { access_token: key }
    });
    const qr = await qrRes.json();

    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
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
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ success: false, erro: e.message })
    };
  }
};
