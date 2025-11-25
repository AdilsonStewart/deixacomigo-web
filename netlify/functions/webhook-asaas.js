// webhook-asaas.js - VERSÃO CORRETA PARA SERVIDOR
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// Inicializar Firebase Admin
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
initializeApp({
  credential: cert(serviceAccount)
});
const db = getFirestore();

export const handler = async (event) => {
  console.log("🔔 WEBHOOK CHAMADO!");

  try {
    const body = JSON.parse(event.body || "{}");

    if (body.event === "PAYMENT_CONFIRMED") {
      const payment = body.payment;
      
      let tipo = '';
      if (payment.value === 5.00) tipo = 'áudio';
      else if (payment.value === 8.00) tipo = 'vídeo';

      // ✅ SALVA NO FIREBASE USANDO ADMIN SDK
      if (tipo) {
        await db.collection('pagamentos').doc(payment.id).set({
          id: payment.id,
          valor: payment.value,
          tipo: tipo,
          status: 'pago',
          data: new Date().toISOString()
        });
        console.log("💾 Salvo no Firebase:", payment.id);
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, message: "Webhook recebido" })
    };

  } catch (error) {
    console.log("❌ ERRO no webhook:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
