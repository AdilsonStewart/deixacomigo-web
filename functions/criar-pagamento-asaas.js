const admin = require("firebase-admin");

if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_JSON || "{}");
  if (Object.keys(serviceAccount).length > 0) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } else {
    admin.initializeApp(); // fallback se JSON estiver vazio
  }
}
const db = admin.firestore();

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json",
  };

  try {
    const body = JSON.parse(event.body || "{}");
    const { valor, tipo, metodo, pedidoId, telefone, nome } = body;

    // VALIDAÇÃO BÁSICA
    if (!valor || !pedidoId) {
      return { statusCode: 400, headers, body: JSON.stringify({ success: false, error: "Faltam dados" }) };
    }

    const ASAAS_KEY = process.env.ASAAS_API_KEY?.trim();
    if (!ASAAS_KEY) throw new Error("ASAAS_API_KEY não configurada");

    // FORÇA SANDBOX (pra garantir enquanto testa)
    const BASE_URL = "https://sandbox.asaas.com/api/v3";
    const asaasHeaders = { "access_token": ASAAS_KEY, "Content-Type": "application/json" };

    // SALVA PEDIDO (mesmo se Firestore falhar, continua)
    try {
      await db.collection("pedidos").doc(pedidoId).set({
        pedidoId,
        nome: nome || "Cliente",
        telefone: telefone || "11999999999",
        valor: Number(valor),
        tipo: tipo || "audio",
        metodo: metodo || "PIX",
        status: "AGUARDANDO_PAGAMENTO",
        criadoEm: admin.firestore.FieldValue.serverTimestamp(),
      });
    } catch (e) {
      console.log("Firestore falhou, mas continua...", e.message);
    }

    // CRIA CLIENTE
    const clienteRes = await fetch(`${BASE_URL}/customers`, {
      method: "POST",
      headers: asaasHeaders,
      body: JSON.stringify({
        name: nome || "Cliente Teste",
        cpfCnpj: "04616557802",
        email: "teste@deixacomigo.com",
        mobilePhone: telefone || "11999999999",
      }),
    });
    const cliente = await clienteRes.json();
    if (cliente.errors) throw new Error("Cliente: " + cliente.errors[0].description);

    // CRIA PAGAMENTO
    const vencimento = new Date();
    vencimento.setDate(vencimento.getDate() + 3);

    const pagamentoRes = await fetch(`${BASE_URL}/payments`, {
      method: "POST",
      headers: asaasHeaders,
      body: JSON.stringify({
        customer: cliente.id,
        billingType: "PIX",
        value: Number(valor).toFixed(2),
        dueDate: vencimento.toISOString().split("T")[0],
        description: "DeixaComigo 30s",
        externalReference: pedidoId,
      }),
    });
    const pagamento = await pagamentoRes.json();
    if (pagamento.errors) throw new Error("Pagamento: " + pagamento.errors[0].description);

    // QR CODE
    const qrRes = await fetch(`${BASE_URL}/payments/${pagamento.id}/pixQrCode`, { headers: asaasHeaders });
    const qr = await qrRes.json();

    // SALVA ID DO ASAAS
    try {
      await db.collection("pedidos").doc(pedidoId).update({ asaasPaymentId: pagamento.id });
    } catch (e) {}

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
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, error: error.message }),
    };
  }
};
