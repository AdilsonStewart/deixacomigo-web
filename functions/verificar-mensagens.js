const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const axios = require('axios');

exports.handler = async function(event, context) {
  try {
    const app = initializeApp();
    const db = getFirestore(app);
    
    const agora = new Date();
    agora.setHours(agora.getHours() - 3); // Fuso -03
    const hojeInicio = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
    const hojeFim = new Date(hojeInicio.getTime() + 24*60*60*1000);
    
    // 🔥 MUDA AQUI: nome da sua coleção no Firestore
    const mensagens = await db.collection('mensagens-agendadas')
      .where('tipo', 'in', ['audio', 'video'])
      .where('dataEnvio', '>=', hojeInicio)
      .where('dataEnvio', '<', hojeFim)
      .where('enviado', '==', false)
      .get();
    
    const enviadas = [];
    
    for (const doc of mensagens.docs) {
      const msg = doc.data();
      
      // Envia MMS pelo ClickSend (suas variáveis já configuradas)
      await axios.post('https://api.clicksend.com/rest/v3/mms/send', {
        messages: [{
          source: "DeixaComigo",
          from: process.env.CLICKSEND_FROM,
          to: msg.telefone,
          subject: msg.titulo || 'Mensagem Multimídia',
          body: `🎥 ${msg.titulo || 'Veja agora'}: ${msg.link}`
        }]
      }, {
        auth: {
          username: process.env.CLICKSEND_USERNAME,
          password: process.env.CLICKSEND_API_KEY
        }
      });
      
      // Marca como enviado
      await doc.ref.update({ 
        enviado: true, 
        enviadoEm: agora,
        status: 'OK'
      });
      
      enviadas.push(`${msg.telefone}: ${msg.link}`);
    }
    
    return {
      statusCode: 200,
      body: JSON.stringify({ 
        ok: true,
        encontrados: mensagens.size,
        enviadas: enviadas.length,
        lista: enviadas.slice(0, 5) // Primeiros 5
      })
    };
    
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
