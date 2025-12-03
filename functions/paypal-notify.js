const admin = require("firebase-admin");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(), // ou suas credenciais JSON
  });
}

const db = admin.firestore();

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Método não permitido" };
  }

  try {
    const data = JSON.parse(event.body);
    const { tipo, pedidoId, status, payer_email } = data;

    if (status === "COMPLETED") {
      const pedidoRef = db.collection("pedidos").doc(pedidoId);

      await pedidoRef.update({
        status: "PAGO",
        pagoEm: admin.firestore.FieldValue.serverTimestamp(),
        emailPagador: payer_email,
      });

      console.log(`Pedido ${pedidoId} atualizado como PAGO`);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true }),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: error.message }),
    };
  }
};
