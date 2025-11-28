// functions/webhook-asaas.js
const admin = require("firebase-admin");
if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();

exports.handler = async (event) => {
  const headers = { "Access-Control-Allow-Origin": "*" };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  try {
    const payload = JSON.parse(event.body);
    const { event, payment } = payload;

    if (event === "PAYMENT_CONFIRMED" || event === "PAYMENT_RECEIVED") {
      const externalReference = payment.externalReference;
      if (externalReference) {
        await db.collection("pedidos").doc(externalReference).update({
          status: "PAGO",
          pagoEm: admin.firestore.FieldValue.serverTimestamp(),
        });
      }
    }

    return { statusCode: 200, headers, body: "OK" };
  } catch (e) {
    console.error(e);
    return { statusCode: 500, headers, body: "Erro" };
  }
};
