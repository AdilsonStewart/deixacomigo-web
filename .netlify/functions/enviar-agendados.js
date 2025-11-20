const admin = require('firebase-admin');
const axios = require('axios');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT))
  });
}
const db = admin.firestore();

// Mapeamento dos horários que a corujinha entrega
const HORARIOS_MAP = {
  '9': '08:00-10:00',
  '11': '10:00-12:00',
  '15': '14:00-16:00',
  '17': '16:00-18:00',
  '19': '18:00-20:00'
};

exports.handler = async () => {
  const agora = new Date();
  const horaAtual = agora.getHours();
  const hoje = agora.toISOString().split('T')[0]; // 2025-11-20

  const horarioAlvo = HORARIOS_MAP[horaAtual];
  if (!horarioAlvo) {
    return { statusCode: 200, body: 'Horário sem entregas programadas' };
  }

  try {
    const snapshot = await db.collection('agendamentos')
      .where('enviado', '==', false)
      .where('dataEnvio', '==', hoje)
      .where('horarioPreferido', '==', horarioAlvo)
      .get();

    if (snapshot.empty) {
      return { statusCode: 200, body: `Nenhum agendamento para ${horarioAlvo} hoje` };
    }

    const envios = [];

    for (const doc of snapshot.docs) {
      const data = doc.data();

      const mensagem = `${data.nomeDestinatario}, tem uma surpresa especial pra você! 🎉\n\nAbra aqui: ${data.linkMensagem}\n\nCom carinho de alguém que te ama ❤️\nDeixa Comigo 🦉`;

      try {
        await axios.post('https://api.clicksend.com/v3/sms/send', {
          messages: [{
            source: "sdk",
            from: "DeixaComigo",
            to: data.telefoneDestinatario,
            body: mensagem
          }]
        }, {
          auth: {
            username: process.env.CLICKSEND_USERNAME,
            password: process.env.CLICKSEND_API_KEY
          }
        });

        await doc.ref.update({ enviado: true, enviadoEm: new Date() });
        console.log(`✔ Enviado para ${data.telefoneDestinatario} às ${horaAtual}h`);
      } catch (erro) {
        console.error(`✖ Erro ao enviar para ${data.telefoneDestinatario}:`, erro.response?.data || erro);
      }
    }

    return { statusCode: 200, body: `Corujinha entregou ${snapshot.size} mensagens às ${horaAtual}h! 🦉❤️` };

  } catch (erro) {
    console.error('Erro geral:', erro);
    return { statusCode: 500, body: 'Deu ruim, mas a gente arruma!' };
  }
};
