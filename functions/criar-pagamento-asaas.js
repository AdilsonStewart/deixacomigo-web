// functions/criar-pagamento-asaas.js
const fetch = require("node-fetch");
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
    console.log("EVENT BODY:", event.body);

    const { valor = 5.00 } = JSON.parse(event.body || "{}");

    if (valor < 5) throw new Error("O valor mínimo permitido pelo Asaas é R$ 5,00");

    const key = process.env.ASAAS_API_KEY?.trim();
    if (!key) throw new Error("Chave Asaas não configurada");

    console.log("ASAAS_API_KEY encontrada");

    // Criar cliente único para evitar duplicidade
    const timestamp = Date.now();
    const clienteRes = await fetch("https://www.asaas.com/api/v3/customers", {
      method: "POST",
      headers: { "access_token": key, "Content-Type": "application/json" },
      body: JSON.stringify({
        name: `Cliente Teste ${timestamp}`,
        cpfCnpj: `046165${timestamp % 10000000}`,
        email: `teste${timestamp}@deixacomigo.com`,
        mobilePhone: "11988265000",
      }),
    });
    const cliente = await clienteRes.json();
    if (cliente.errors) throw new Error("Cliente: " + cliente.errors[0].description);

    console.log("Cliente criado:", cliente.id);

    // Criar pagamento PIX
    const pagamentoRes = await fetch("https://www.asaas.com/api/v3/payments", {
      method: "POST",
      headers: { "access_token": key, "Content-Type": "application/json" },
      body: JSON.stringify({
        customer: cliente.id,
        billingType: "PIX",
        value: Number(valor).toFixed(2),
        dueDate: new Date(Date.now() + 3 * 86400000).toISOString().split("T")[0],
        description: "DeixaComigo",
      }),
    });
    const pagamento = await pagamentoRes.json();
    if (pagamento.errors) throw new Error(pagamento.errors[0].description);

    console.log("Pagamento criado:", pagamento.id);

    // Pegar QR code PIX
    const qr = await fetch(`https://www.asaas.com/api/v3/payments/${pagamento.id}/pixQrCode`, {
      headers: { "access_token": key },
    }).then(r => r.json());

    console.log("QR code gerado");

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
    console.error("ERRO NA FUNÇÃO:", error.message);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, error: error.message }),
    };
  }
};
