// functions/criar-pix-asaas.js
const axios = require('axios');
const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

exports.handler = async (event) => {
  try {
    const { uid, valor, tipo } = JSON.parse(event.body || '{}');

    // validação básica
    if (!uid || !valor || !tipo) {
      return { statusCode: 400, body: JSON.stringify({ erro: 'UID, valor e tipo são obrigatórios' }) };
    }

    // busca usuário no Firestore
    const userRef = db.collection('usuarios-asaas').doc(uid);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      return { statusCode: 404, body: JSON.stringify({ erro: 'Usuário não encontrado' }) };
    }

    const userData = userSnap.data();
    const { nome, cpf, telefone, nascimento, customerId } = userData;

    if (!nome || !cpf || !telefone || !nascimento) {
      return { statusCode: 400, body: JSON.stringify({ erro: 'Campos obrigatórios ausentes no Firestore' }) };
    }

    let finalCustomerId = customerId;

    // criar cliente no Asaas se ainda não existir
    if (!finalCustomerId) {
      const clienteRes = await axios.post(
        'https://www.asaas.com/api/v3/customers',
        {
          name: nome,
          cpfCnpj: cpf,
          phone: telefone,
          // email omitido
          externalReference: `deixacomigo_${uid}`
        },
        { headers: { 'access_token': process.env.ASAAS_API_KEY, 'Content-Type': 'application/json' } }
      );

      finalCustomerId = clienteRes.data.id;

      // salva o customerId no Firestore
      await userRef.update({ customerId: finalCustomerId });
    }

    // cria pagamento PIX
    const pagamentoRes = await axios.post(
      'https://www.asaas.com/api/v3/payments',
      {
        customer: finalCustomerId,
        billingType: 'PIX',
        value: Number(valor),
        dueDate: new Date().toISOString().split('T')[0],
        description: `Mensageiro - ${tipo}`,
        externalReference: `deixacomigo_${Date.now()}`
      },
      { headers: { 'access_token': process.env.ASAAS_API_KEY, 'Content-Type': 'application/json' } }
    );

    const pagamento = pagamentoRes.data;

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        qrCodeUrl: pagamento.pixQrCodeImage,
        copiaECola: pagamento.encodedImage,
        pagamentoId: pagamento.id
      }),
    };

  } catch (error) {
    console.error('Erro Asaas:', error.response?.data || error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ erro: 'Erro ao gerar PIX Asaas', detalhes: error.response?.data || error.message }),
    };
  }
};
