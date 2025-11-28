const admin = require("firebase-admin");

if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_JSON);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}
const db = admin.firestore();

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "Método não permitido" };

  try {
    const { nome, telefone, dataNascimento } = JSON.parse(event.body);

    if (!nome || !telefone || !dataNascimento) {
      return { statusCode: 400, body: JSON.stringify({ success: false, error: "Dados faltando" }) };
    }

    // Gera número do pedido
    const counterRef = db.collection("Config").doc("pedidos");
    const counterSnap = await counterRef.get();
    let numeroPedido = 1;
    if (counterSnap.exists) {
      numeroPedido = counterSnap.data().ultimoNumero + 1;
    }
    await counterRef.set({ ultimoNumero: numeroPedido }, { merge: true });

    // Salva cliente
    await db.collection("clientes").doc(telefone).set({
      nome,
      telefone,
      dataNascimento,
      numeroPedido,
      statusPagamento: "aguardando",
      tipo: null,
      criadoEm: new Date().toISOString(),
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
