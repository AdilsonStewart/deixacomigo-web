// functions/webhook-asaas.js
const admin = require("firebase-admin");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)),
  });
}

const db = admin.firestore();

exports.handler = async (event) => {
  // Cabeçalhos de segurança e CORS
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  // Verifica se é um POST (Asaas só manda POST)
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: "Método não permitido" };
  }

  try {
    const body = JSON.parse(event.body || "{}");

    // Asaas manda um campo "event" tipo PAYMENT_CONFIRMED, PAYMENT_RECEIVED etc
    if (body.event !== "PAYMENT_CONFIRMED" && body.event !== "PAYMENT_RECEIVED") {
      console.log("Evento ignorado:", body.event);
      return { statusCode: 200, body: "Evento ignorado" };
    }

    const pagamento = body.payment;
    if (!pagamento) {
      return { statusCode: 400, body: "Campo 'payment' não encontrado" };
    }

    const pedidoId = pagamento.externalReference;

    if (!pedidoId) {
      console.log("Pagamento sem externalReference:", pagamento.id);
      return { statusCode: 400, body: "externalReference não informado" };
    }

    // Busca o pedido no Firestore usando o pedidoId
    const pedidoRef = db.collection("pedidos").doc(pedidoId);
    const pedidoDoc = await pedidoRef.get();

    if (!pedidoDoc.exists) {
      console.log("Pedido não encontrado no Firestore:", pedidoId);
      return { statusCode: 404, body: "Pedido não encontrado" };
    }

    // Atualiza o status para PAGO
    await pedidoRef.update({
      status: "PAGO",
      pagoEm: admin.firestore.FieldValue.serverTimestamp(),
      asaasStatus: pagamento.status,
      valorPago: pagamento.value,
    });

    console.log(`Pagamento CONFIRMADO e gravado! Pedido: ${pedidoId} | Valor: R$ ${pagamento.value}`);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, mensagem: "Pagamento confirmado com sucesso" }),
    };
  } catch (error) {
    console.error("Erro no webhook Asaas:", error.message);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ erro: error.message }),
    };
  }
};
