// netlify/functions/salvar-video.js
const { ref, uploadBytes, getDownloadURL } = require("firebase/storage");
const { storage } = require("firebase-admin/storage");
const { initializeApp, getApps } = require("firebase-admin/app");

// Inicializa Firebase Admin (funciona no Netlify sem service account)
if (!getApps().length) {
  initializeApp();
}

const bucket = storage().bucket(); // usa o bucket padrão do projeto

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Método não permitido" };
  }

  try {
    const formData = new URLSearchParams(event.body);
    const file = event.isBase64Encoded 
      ? Buffer.from(event.body.split(",")[1], "base64")
      : event.body; // Netlify já manda como buffer

    // Pega o arquivo do FormData (o React manda como multipart)
    const boundary = event.headers["content-type"].split("boundary=")[1];
    const parts = event.body.split(`--${boundary}`);
    let videoBuffer = null;
    let filename = `video_${Date.now()}.webm`;

    for (const part of parts) {
      if (part.includes("filename=")) {
        const match = part.match(/filename="(.+?)"/);
        if (match) filename = match[1];
        const start = part.indexOf("\r\n\r\n") + 4;
        const end = part.lastIndexOf("\r\n--");
        videoBuffer = Buffer.from(part.slice(start, end), "binary");
      }
    }

    if (!videoBuffer) {
      const rawBody = Buffer.from(event.body, event.isBase64Encoded ? "base64" : "utf8");
      videoBuffer = rawBody;
    }

    const fileRef = bucket.file(`videos/${filename}`);
    await fileRef.save(videoBuffer, {
      metadata: { contentType: "video/webm" },
    });

    await fileRef.makePublic();
    const publicUrl = `https://storage.googleapis.com/${bucket.bucketName}/${fileRef.name}`;

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ success: true, url: publicUrl }),
    };

  } catch (error) {
    console.error("Erro ao salvar vídeo:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: error.message }),
    };
  }
};
