const { getFirestore } = require("firebase-admin/firestore");
const fetch = require("node-fetch");

const db = getFirestore();

exports.handler = async () => {
  const agora = new Date();
  agora.setSeconds(0);
  const horaAtual = agora.toTimeString().slice(0, 5); // ex: "09:00"
  const hoje = agora.toISOString().split("T")[0];     // ex: "2025-11-30"

  const horariosPermitidos = ["09:00","10:00","11:00","14:00","15:00","16:00","17:00"];
  if (!horariosPermitidos.includes(horaAtual)) {
    console.log("Horário ignorado:", horaAtual);
    return { statusCode: 200 };
  }

  const snap = await db.collection("agendamentos")
    .where("data", "==", hoje)
    .where("hora", "==", horaAtual)
    .where("enviado", "==", false)
    .get();

  if (snap.empty) {
    console.log("Nenhum agendamento para", horaAtual);
    return { statusCode: 200 };
  }

  const auth = Buffer.from(
    `${process.env.CLICKSEND_USER}:${process.env.CLICKSEND_KEY}`
  ).toString("base64");

  for (const doc of snap.docs) {
    const ag = doc.data();

    const payload = {
      messages: [{
        source: "sdk",
        from: "DeixaComigo",
        to: ag.telefone,
        body: `Olá ${ag.nome}! Aqui está seu áudio agendado com carinho ❤️\n${ag.linkMidia}`
      }]
    };

    const resp = await fetch("https://rest.clicksend.com/v3/sms/send", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${auth}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    console.log("ClickSend resposta:", await resp.json());

    await doc.ref.update({
      enviado: true,
      enviadoEm: new Date()
    });
  }

  return { statusCode: 200, body: "Enviados com ClickSend!" };
};
