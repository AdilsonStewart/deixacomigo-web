// netlify/functions/salvar-agendamento.js
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

// Inicializa sem precisar de service account (Netlify já tem acesso)
initializeApp();

const db = getFirestore();

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Método não permitido" };
  }

  try {
    const dados = JSON.parse(event.body);

    await db.collection("agendamentos").add({
      nome: dados.nome || "Sem nome",
      telefone: dados.telefone || "",
      data: dados.data || "",
      hora: dados.hora || "",
      linkMidia: dados.linkMidia || "",
      criadoEm: new Date(),
      enviado: false,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true }),
    };
  } catch (error) {
    console.error("Erro:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: error.message }),
    };
  }
};
