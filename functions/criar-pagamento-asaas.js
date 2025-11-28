const admin = require("firebase-admin");

// INICIALIZA CORRETAMENTE COM A SERVICE ACCOUNT
if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_JSON || "{}");
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}
const db = admin.firestore();

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  if (event.httpMethod !== "POST") return { statusCode: 405, headers, body: "Método não permitido" };

  try {
    const { valor, tipo, metodo, pedidoId, telefone, nome } = JSON.parse(event.body || "{}");

    if (!valor || !tipo || !metodo || !pedidoId) {
      return { statusCode: 400, headers, body: JSON.stringify({ success: false, error: "Faltam dados" }) };
    }

    const ASAAS_API_KEY = process.env.ASAAS_API_KEY;
    if (!ASAAS_API_KEY) throw new Error("Chave Asaas não configurada");

    // SALVA PEDIDO NO FIRESTORE
    await db.collection("pedidos").doc(pedidoId).set({
      pedidoId,
      nome: nome || "Cliente",
      telefone: telefone || "11999999999",
      valor: Number(valor),
      tipo,
      metodo,
      status: "AGUARDANDO_PAGAMENTO",
      usado: false,
      criadoEm: admin.firestore.FieldValue.serverTimestamp(),
    });

    // DETECTA SANDBOX OU PRODUÇÃO
    const BASE_URL = ASAAS_API_KEY.startsWith("sk_test_")
      ? "https://sandbox.asaas.com/api/v3"
      : "https://api.asaas.com/v3";

    const asaasHeaders = { "access_token": ASAAS_API_KEY, "Content-Type": "application/json" };

    // CRIA CLIENTE
    const clienteRes = await fetch(`${BASE_URL}/customers`, {
      method: "POST",
      headers: asaasHeaders,
      body: JSON.stringify({
        name: nome || "Cliente DeixaComigo",
        cpfCnpj: "04616557802",
        email: "cliente@deixacomigo.com",
        mobilePhone: telefone || "11999999999",
      }),
    });
    const cliente = await clienteRes.json();
    if (cliente.errors) throw new Error(cliente.errors[0].description);

    const vencimento = new Date();
    vencimento.setDate(vencimento.getDate() + 3);

    // CRIA PAGAMENTO PIX
    const pagamentoRes = await fetch(`${BASE_URL}/payments`, {
      method: "POST",
      headers: asaasHeaders,
      body: JSON.stringify({
        customer: cliente.id,
        billingType: "PIX",
        value: Number(valor).toFixed(2),
        dueDate: vencimento.toISOString().split("T")[0],
        description: `DeixaComigo - ${tipo} 30s`,
        externalReference: pedidoId,
      }),
    });
    const pagamento = await pagamentoRes.json();
    if (pagamento.errors) throw new Error(pagamento.errors[0].description);

    // QR CODE
    const qrRes = await fetch(`${BASE_URL}/payments/${pagamento.id}/pixQrCode`, { headers: asaasHeaders });
    const qr = await qrRes.json();

    // SALVA ID DO PAGAMENTO
    await db.collection("pedidos").doc(pedidoId).update({ asaasPaymentId: pagamento.id });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        pedidoId,
        qrCodeBase64: qr.encodedImage,
        copiaECola: qr.payload,
      }),
    };
  } catch (error) {
    console.error("ERRO NA FUNCTION:", error.message);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, error: error.message }),
    };
  }
};
