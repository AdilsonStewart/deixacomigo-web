const admin = require('firebase-admin');
const axios = require('axios');

// Inicializa o Firebase com a service account que você colocou no Netlify
if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

exports.handler = async (event, context) => {
  try {
    const mensagem = "Oi Adilson! Sou a corujinha do DeixaComigo e já estou funcionando direitinho! 🦉❤️";
    const telefone = "+5541999999999"; // ← TROQUE AQUI PELO SEU CELULAR COM +55 (ex: +5541988887777)

    await axios.post('https://api.clicksend.com/v3/sms/send', {
      messages: [
        {
          source: "sdk",
          from: "DeixaComigo",
          to: telefone,
          body: mensagem
        }
      ]
    }, {
      auth: {
        username: process.env.CLICKSEND_USERNAME,
        password: process.env.CLICKSEND_API_KEY
      }
    });

    return {
      statusCode: 200,
      body: "SMS enviado com sucesso! Olha o celular 🦉"
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: "Deu ruim... mas a gente arruma juntinhos ❤️"
    };
  }
};
