// functions/salvar-cadastro.js
const admin = require("firebase-admin");

if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_JSON);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

exports.handler = async (event) => {
  if (event.httpMethod !== "POST")
    return { statusCode: 405, body: "Método não permitido" };

  try {
    const {
      nome,
      telefone,
      dataNascimento,
      cpfCnpj,
      email
    } = JSON.parse(event.body);

    // Validação
    if (!nome || !telefone || !dataNascimento || !cpfCnpj || !email) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          error: "Dados faltando"
        }),
      };
    }

    // Gera número do pedido incremental
    const counterRef = db.collection("Config").doc("pedidos");
    const counterSnap = await counterRef.get();

    let numeroPedido = 1;

    if (counterSnap.exists) {
      numeroPedido = counterSnap.data().ultimoNumero + 1;
    }

    await counterRef.set(
      { ultimoNumero: numeroPedido },
      { merge: true }
    );

    // Salva cliente usando telefone como ID
    await db.collection("clientes").doc(telefone).set({
      nome,
      telefone,
      dataNascimento,
      cpfCnpj,
      email,
      numeroPedido,
      statusPagamento: "aguardando",
      tipo: null,
      criadoEm: new Date().toISOString(),
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, numeroPedido }),
    };

  } catch (error) {
    console.error("Erro ao salvar cadastro:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: error.message }),
    };
  }
};
