// Importar Firebase - caminho CORRETO
import { db } from '../../../src/firebase/config.js';
import { doc, setDoc } from 'firebase/firestore';

export const handler = async (event) => {
  console.log("🔔 WEBHOOK CHAMADO!");

  try {
    const body = JSON.parse(event.body || "{}");
    console.log("📦 Dados recebidos:", JSON.stringify(body, null, 2));

    // Verifica se é uma confirmação de pagamento
    if (body.event === "PAYMENT_CONFIRMED") {
      const payment = body.payment;
      console.log("✅ PAGAMENTO CONFIRMADO!");
      console.log("💰 Valor:", payment.value);
      console.log("🎯 ID:", payment.id);
      
      // Determina o tipo baseado no valor
      let tipo = '';
      if (payment.value === 5.00) {
        tipo = 'áudio';
        console.log("🎧 Cliente comprou ÁUDIO");
      } else if (payment.value === 8.00) {
        tipo = 'vídeo';
        console.log("🎥 Cliente comprou VÍDEO");
      }

      // ✅ SALVA NO FIREBASE
      if (tipo) {
        await setDoc(doc(db, 'pagamentos', payment.id), {
          id: payment.id,
          valor: payment.value,
          tipo: tipo,
          status: 'pago',
          data: new Date().toISOString(),
          cliente: payment.customer || 'Não informado'
        });
        console.log("💾 Salvo no Firebase:", payment.id);
      }
    }

    // SEMPRE responde 200 para a Asaas
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
