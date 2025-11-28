// functions/criar-pagamento-asaas.js  ← VERSÃO FINAL QUE FUNCIONA COM CHAVES CADASTRADAS
const admin = require("firebase-admin");

if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_JSON || "{}");
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

exports.handler = async (event) => {
  const headers = { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" };

  try {
    const { valor = 5.00 } = JSON.parse(event.body || "{}");

    const key = process.env.ASAAS_API_KEY?.trim();
    if (!key) throw new Error("Chave Asaas não configurada");

    // CRIA CLIENTE MÍNIMO (obrigatório no sandbox quando já tem chaves cadastradas)
    const clienteRes = await fetch("https://sandbox.asaas.com/api/v3/customers", {
      method: "POST",
      headers: { "access_token": key, "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Cliente Teste",
        cpfCnpj: "04616557802",
        email: "teste@deixacomigo.com",
        mobilePhone: "11988265000",
      }),
    });
    const cliente = await clienteRes.json();
    if (cliente.errors) throw new Error("Cliente: " + cliente.errors[0].description);

    // CRIA PAGAMENTO
    const pagamentoRes = await fetch("https://sandbox.asaas.com/api/v3/payments", {
      method: "POST",
      headers: { "access_token": key, "Content-Type": "application/json" },
      body: JSON.stringify({
        customer: cliente.id,           // ← ESSA LINHA É OBRIGATÓRIA AGORA
        billingType: "PIX",
        value: Number(valor).toFixed(2),
        dueDate: new Date(Date.now() + 3*86400000).toISOString().split("T")[0],
        description: "DeixaComigo 30s",
      }),
    });
    const pagamento = await pagamentoRes.json();
    if (pagamento.errors) throw new Error(pagamento.errors[0].description);

    // QR CODE
    const qr = await fetch(`https://sandbox.asaas.com/api/v3/payments/${pagamento.id}/pixQrCode`, {
      headers: { "access_token": key },
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
  } catch (error) {
    console.error("ERRO:", error.message);
    return { statusCode: 500, headers, body: JSON.stringify({ success: false, error: error.message }) };
  }
};
