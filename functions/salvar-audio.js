import { initializeApp } from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";
import firebaseAdmin from "firebase-admin";

// Inicializa o Firebase Admin só uma vez
if (!firebaseAdmin.apps.length) {
  firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert(
      JSON.parse(Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT, "base64").toString())
    ),
    storageBucket: "deixacomigo-727ff.appspot.com",
  });
}

const bucket = getStorage().bucket();

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return { statusCode: 405 };

  try {
    const formData = new URLSearchParams(event.body);
    const nome = formData.get("nome");
    const telefone = formData.get("telefone");
    const dataEntrega = formData.get("dataEntrega");
    const horaEntrega = formData.get("horaEntrega");

    // O áudio vem em base64 (vamos receber assim no front)
    const audioBase64 = event.body.match(/data:audio[^;]+;base64,(.+)/)?.[0];
    if (!audioBase64) throw new Error("Áudio não encontrado");

    const buffer = Buffer.from(audioBase64[1], "base64");
    const fileName = `audios/gravacao_${Date.now()}.webm`;

    // Salva no Storage
    const file = bucket.file(fileName);
    await file.save(buffer, {
      metadata: { contentType: "audio/webm" },
      public: true,
    });

    const publicUrl = `https://firebasestorage.googleapis.com/v0/b/deixacomigo-727ff.appspot.com/o/${encodeURIComponent(
      fileName
    )}?alt=media`;

    // Aqui você pode salvar no Firestore também se quiser (pedidos)
    // (deixa pra depois se quiser)

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        url: publicUrl,
        mensagem: "Áudio salvo com sucesso!",
      }),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: error.message }),
    };
  }
};
