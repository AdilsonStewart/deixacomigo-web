const fetch = require("node-fetch"); // se necessário instalar

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Método não permitido" };
  }

  try {
    const data = JSON.parse(event.body);

    // Aqui você pode validar a notificação do PayPal
    // Para IPN/Webhook real, você deve verificar com PayPal
    // Por simplicidade, assumimos que data.status === "COMPLETED"
    const { tipo, pedidoId, status, payer_email } = data;

    if (status === "COMPLETED") {
      // Atualizar seu pedido no Firebase
      // Exemplo usando Firestore (assumindo já configurado)
      const admin = require("firebase-admin");
      if (!admin.apps.length) {
        admin.initializeApp({
          credential: admin.
