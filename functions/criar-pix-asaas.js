const axios = require('axios');
const admin = require('firebase-admin');

// Inicializa o Firebase Admin usando a variável de ambiente
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(
      JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
    )
  });
}

const db = admin.firestore();

exports.handler = async (event) => {
  try {
    const { valor, tipo, userId } = JSON.parse(event.body || '{}');

    if (!valor || !tipo || !userId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ erro: 'Valor, tipo e userId são obrigatórios' }),
      };
    }

    // Puxar dados do usuário no Firestore
    const userRef = db.collection('usuarios-asaas').doc(userId);
    const userSnap = await userRef.get();
    if (!userSnap.exists) {
      return {
        statusCode: 404,
        body: JSON.stringify({ erro: 'Usuário não encontrado' }),
      };
    }
    const userData = userSnap.data();

    // Criar pagamento no Asaas
    const response = await axios.post(
      'https://www.asaas.com/api/v3/payments',
      {
        customer: userData.customerId, // precisa ter sido criado antes
        billingType: 'PIX',
        value: Number(valor),
        dueDate: new Date().toISOString().split('T')[0],
        description: `Mensageiro - ${tipo}`,
        externalReference: `deixacomigo_${Date.now()}`,
      },
      {
        headers: {
          'access_token': process.env.ASAAS_API_KEY,
          'Content-Type': 'application/json',
        },
      }
    );

    const pagamento = response.data;

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        qrCodeUrl: pagamento.pixQrCodeImage,
        copiaECola: pagamento.encodedImage,
        pagamentoId: pagamento.id,
      }),
    };
  } catch (error) {
    console.error('Erro Asaas:', error.response?.data || error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({
        erro: 'Erro ao gerar PIX Asaas',
        detalhes: error.message,
      }),
    };
  }
};
