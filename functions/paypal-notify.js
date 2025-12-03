// functions/paypal-notify.js
import admin from "firebase-admin";

// Inicialize o Firebase (use suas credenciais)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      type: "service_account",
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
    }),
    databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`,
  });
}

const db = admin.firestore();

export const handler = async (event) => {
  try {
    const body = JSON.parse(event.body);

    // Apenas processa eventos de pagamento concluído
    if (
      body.event_type === "PAYMENT.CAPTURE.COMPLETED" ||
      body.event_type === "PAYMENT.SALE.COMPLETED"
    ) {
      // Pega informações importantes
      const custom = body.resource.custom; // Você envia isso ao criar o pagamento
      const transactionId = body.resource.id;
      const email = body.resource.payer?.email_address || "";

      if (!custom) {
        return { statusCode: 400, body: "Pedido não identificado" };
      }

      // Atualiza pedido no Firebase
      const pedidoRef = db.collection("pedidos").doc(custom);
      await pedidoRef.update({
        status: "PAGO",
        transactionId,
        payerEmail: email,
        pagoEm: new Date().toISOString(),
      });

      return { statusCode: 200, body: "Webhook processado com sucesso" };
    }

    return { statusCode: 200, body: "Evento ignorado" };
  } catch (error) {
    console.error("Erro no Webhook PayPal:", error);
    return { statusCode: 500, body: "Erro ao processar Webhook" };
  }
};
