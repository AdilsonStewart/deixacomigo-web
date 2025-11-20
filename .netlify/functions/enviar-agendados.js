const { schedule } = require("@netlify/functions");
const admin = require('firebase-admin');
const axios = require('axios');

// Inicializa Firebase
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT))
  });
}
const db = admin.firestore();

// Horários que a corujinha entrega
const HORARIOS_MAP = {
  '9': '08:00-10:00',
  '11': '10:00-12:00',
  '15': '14:00-16:00',
  '17': '16:00-18:00',
  '19': '18:00-20:00'
};

const handler = async () => {
  const agora = new Date();
  const horaAtual = agora.getHours();
  const hoje = agora.toISOString().split('T')[0];

  const horarioAlvo = HORARIOS_MAP[horaAtual];
  if (!horarioAlvo) {
    return { statusCode: 200, body: 'Sem entregas nesse horário' };
  }

  const snapshot = await db.collection('agendamentos')
    .where('enviado', '==', false)
    .where('dataEnvio', '==', hoje)
    .where('horarioPreferido', '==', horarioAlvo)
    .get();

  if (snapshot.empty) {
    return { statusCode: 200, body: 'Nenhum agendamento hoje nesse horário' };
  }

  for (const doc of snapshot.docs) {
    const data = doc.data();
    const mensagem = `${data.nomeDestinatario}, tem uma surpresa pra você! 🎉\n\n${data.linkMensagem}\n\nCom carinho ❤️\nDeixa Comigo 🦉`;

    try {
      await axios.post('https://api.clicksend.com/v3/sms/send', {
        messages: [{ source: "sdk", from: "DeixaComigo", to: data.telefoneDestinatario, body: mensagem }]
      }, {
        auth: { username: process.env.CLICKSEND_USERNAME, password: process.env.CLICKSEND_API_KEY }
      });

      await doc.ref.update({ enviado: true, enviadoEm: new Date() });
    } catch (e) {
      console.error('Erro no envio:', e.response?.data || e);
    }
  }

  return { statusCode: 200, body: `Corujinha entregou ${snapshot.size} mensagens! 🦉` };
};

// A mágica: roda nos 5 horários de segunda a sábado
const scheduledHandler = schedule("0 9,11,15,17,19 * * 1-6", handler);

exports.handler = scheduledHandler;
