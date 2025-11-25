// webhook-asaas.js - VERSÃO SERVIDOR
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// Inicializar Firebase Admin (vamos configurar depois)
// const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
// initializeApp({ credential: cert(serviceAccount) });
// const db = getFirestore();

export const handler = async (event) => {
  console.log("🔔 WEBHOOK CHAMADO!");

  try {
    const body = JSON.parse(event.body || "{}");
    console.log("📦 Dados recebidos:", body.event);

    if (body.event === "PAYMENT_CONFIRMED") {
      const payment = body.payment;
      console.log("✅ PAGAMENTO CONFIRMADO!", payment.id);
      
      // POR ENQUANTO SÓ LOGAMOS
      // Depois configuramos o Firebase Admin
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
