import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// Inicializa o Firebase Admin (só uma vez)
let app;
if (!getApps()?.length) {
  app = initializeApp();
}

const db = getFirestore();

export const handler = async (event) => {
  // Só aceita POST
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Método não permitido" };
  }

  try {
    const body = JSON.parse(event.body || "{}");
    const { nome, telefone, dataNascimento, cpfCnpj, email } = body;

    if (!nome || !telefone || !email) {
      return {
        statusCode: 400,
        body: JSON.stringify({ success: false, error: "Faltam dados obrigatórios" }),
      };
    }

    // Salva no Firestore
    const docRef = await db.collection("clientes").add({
      nome,
      telefone,
      dataNascimento: dataNascimento || null,
      cpfCnpj: cpfCnpj || null,
      email,
      criadoEm: new Date(),
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        clienteId: docRef.id,
      }),
    };
  } catch (error) {
    console.error("Erro em salvar-cliente:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: error.message || "Erro interno",
      }),
    };
  }
};
