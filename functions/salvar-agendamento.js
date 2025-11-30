const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

if (!initializeApp.length) initializeApp();
const db = getFirestore();

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return { statusCode: 405 };

  try {
    const dados = JSON.parse(event.body);

    await db.collection("agendamentos").add({
      ...dados,
      criadoEm: new Date(),
      enviado: false
    });

    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  } catch (e) {
    console.error(e);
    return { statusCode: 500, body: JSON.stringify({ success: false, error: e.message }) };
  }
};
