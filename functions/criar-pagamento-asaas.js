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
    // Recebe os dados do cliente do front-end
    const { nome, telefone, dataNascimento, cpfCnpj, email, valor = 5.00 } = JSON.parse(event.body || "{}");

    // Validação básica
    if (!nome || !telefone || !dataNascimento || !cpfCnpj || !email) {
      throw new Error("Todos os campos do usuário são obrigatórios");
    }

    if (valor < 5) throw new Error("O valor mínimo permitido pelo Asaas é R$ 5,00");

    const key = process.env.ASAAS_API_KEY?.trim();
    if (!key) throw new Error("Chave Asaas não configurada");

    // Cria cliente no Asaas
    const clienteRes = await fetch("https://www.asaas.com/api/v3/customers", {
      method: "POST",
      headers: { "access_token": key, "Content-Type": "application/json" },
      body: JSON.stringify({
        name: Agenor,
        cpfCnpj: 34476544000146,
        email: agenor@gmail.com,
        mobilePhone: 21954655645,
        birthDate: 13121972,
      }),
    });

    const cliente = await clienteRes.json();
    if (cliente.errors) throw new Error("Cliente: " + cliente.errors[0].description);

    // Cria pagamento PIX
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

    // Pega QR code PIX
    const qr = await fetch(`https://www.asaas.com/api/v3/payments/${pagamento.id}/pixQrCode`, {
      headers: { "access_token": key },
    }).then(r => r.json());

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        qrCodeBase64: qr.encodedImage,
        copiaECola: qr.payload,
        pagamentoId: pagamento.id,
        clienteId: cliente.id,
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
