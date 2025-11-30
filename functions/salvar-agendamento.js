// netlify/functions/salvar-agendamento.js
const fetch = require('node-fetch');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Método não permitido' };
  }

  try {
    const dados = JSON.parse(event.body);

    // Usa a REST API do Firestore (nunca falha no Netlify)
    const url = `https://firestore.googleapis.com/v1/projects/deixacomigo-727ff/databases/(default)/documents/agendamentos`;

    const payload = {
      fields: {
        nome: { stringValue: dados.nome || "Sem nome" },
        telefone: { stringValue: dados.telefone || "" },
        data: { stringValue: dados.data || "" },
        hora: { stringValue: dados.hora || "" },
        linkMidia: { stringValue: dados.linkMidia || "" },
        criadoEm: { timestampValue: new Date().toISOString() },
        enviado: { booleanValue: false }
      }
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error('Erro no Firestore');

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true })
    };

  } catch (error) {
    console.error("Erro:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: error.message })
    };
  }
};
