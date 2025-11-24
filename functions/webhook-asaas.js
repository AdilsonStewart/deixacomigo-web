// functions/webhook-asaas.js
const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body || '{}');

    // Aceita apenas eventos de pagamento confirmado
    if (body.event !== 'PAYMENT_CONFIRMED') {
      console.log('Evento ignorado:', body.event);
      return { statusCode: 200, body: 'ignorado' };
    }

    const pagamento = body.payment;
    if (!pagamento || !pagamento.customer) {
      return { statusCode: 400, body: JSON.stringify({ erro: 'Pagamento ou customer não informado' }) };
    }

    const customerId = pagamento.customer;
    const pagamentoId = pagamento.id;

    console.log(`✅ Pagamento confirmado: ${pagamentoId} (customerId: ${customerId})`);

    // Busca usuário pelo customerId no Firestore
    const usersRef = db.collection('usuarios-asaas');
    const query = usersRef.where('customerId', '==', customerId).limit(1);
    const snapshot = await query.get();

    if (snapshot.empty) {
      console.log('❌ Nenhum usuário encontrado para este customerId');
      return { statusCode: 404, body: JSON.stringify({ erro: 'Usuário não encontrado' }) };
    }

    const userDoc = snapshot.docs[0];
    await userDoc.ref.update({ pago: true, pagoEm: new Date() });

    console.log(`💚 Usuário ${userDoc.id} liberado com sucesso`);

    return { statusCode: 200, body: JSON.stringify({ success: true }) };

  } catch (err) {
    console.error('❌ Erro webhook Asaas:', err.message);
    return { statusCode: 500, body: JSON.stringify({ erro: err.message }) };
  }
};
