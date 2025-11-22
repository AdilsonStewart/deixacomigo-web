// functions/criar-pix-asaas.js
const axios = require('axios');

exports.handler = async (event) => {
  try {
    const { valor, tipo } = JSON.parse(event.body || '{}');

    if (!valor || !tipo) {
      return { statusCode: 400, body: JSON.stringify({ erro: 'Valor e tipo são obrigatórios' }) };
    }

    const response = await axios.post(
      'https://api.asaas.com/v3/payments',
      {
        customer: null, // vamos criar o cliente dinamicamente ou usar um padrão depois
        billingType: 'PIX',
        value: Number(valor),
        dueDate: new Date().toISOString().split('T')[0], // hoje
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
        qrCodeUrl: pagamento.pixQrCodeImage,   // imagem do QR Code
        copiaECola: pagamento.encodedImage,    // código copia e cola
        pagamentoId: pagamento.id,             // pra webhook depois
      }),
    };
  } catch (error) {
    console.error('Erro Asaas:', error.response?.data || error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ erro: 'Erro ao gerar PIX Asaas', detalhes: error.message }),
    };
  }
};
