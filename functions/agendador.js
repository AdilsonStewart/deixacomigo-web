const admin = require("firebase-admin");
const fetch = require("node-fetch");

// Inicializa Firebase Admin
if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_JSON || "{}");
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

exports.handler = async () => {
  const db = admin.firestore();

  // Horário atual no formato HH:MM
  const agora = new Date();
  agora.setSeconds(0);
  const horaAtual = agora.toTimeString().slice(0, 5);

  console.log("⏰ Executando agendador para horário:", horaAtual);

  try {
    // BUSCAR AGENDAMENTOS DO DIA
    const hoje = new Date();
    const hojeStr = hoje.toISOString().split("T")[0]; // ex: 2025-11-29

    const query = await db
      .collection("agendamentos")
      .where("data", "==", hojeStr)
      .where("hora", "==", horaAtual)
      .where("enviado", "==", false)
      .get();

    if (query.empty) {
      console.log("Nenhum agendamento para agora.");
      return { statusCode: 200, body: "Sem agendamentos." };
    }

    const resultados = [];

    for (const doc of query.docs) {
      const ag = doc.data();

      console.log("📌 Processando agendamento:", ag);

      const linkMidia = ag.linkMidia;  // link do áudio/vídeo Firestore Storage
      const telefone = ag.telefone;    // enviado no cadastro
      const nome = ag.nome;

      // Envio via ClickSend
      const smsPayload = {
        messages: [
          {
            source: "api",
            body: `Olá ${nome}! Aqui está seu conteúdo agendado: ${linkMidia}`,
            to: telefone,
            schedule: null
          }
        ]
      };

      const clicksendResp = await fetch("https://rest.clicksend.com/v3/sms/send", {
        method: "POST",
        headers: {
          "Authorization":
            "Basic " +
            Buffer.from(
              process.env.CLICKSEND_USER + ":" + process.env.CLICKSEND_KEY
            ).toString("base64"),
          "Content-Type": "application/json"
        },
        body: JSON.stringify(smsPayload)
      }).then(r => r.json());

      console.log("📤 ClickSend resposta:", clicksendResp);

      // Marca como enviado
      await doc.ref.update({
        enviado: true,
        enviadoEm: admin.firestore.FieldValue.serverTimestamp()
      });

      resultados.push({
        id: doc.id,
        telefone,
        status: "Enviado"
      });
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true, enviados: resultados })
    };
  } catch (err) {
    console.error("❌ ERRO NO AGENDADOR:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
