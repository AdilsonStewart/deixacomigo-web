// netlify/functions/salvar-video.js
const { initializeApp } = require("firebase/app");
const { getStorage, ref, uploadBytes, getDownloadURL } = require("firebase/storage");

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Método não permitido" };
  }

  try {
    // Pega o buffer do vídeo do body (Netlify manda como string)
    const buffer = Buffer.from(event.body, "binary");

    if (buffer.length === 0) {
      throw new Error("Vídeo vazio – tente gravar de novo");
    }

    // Nome único
    const filename = `videos/video_${Date.now()}.webm`;
    const videoRef = ref(storage, filename);

    // Upload
    await uploadBytes(videoRef, buffer, {
      contentType: "video/webm",
    });

    // URL pública
    const url = await getDownloadURL(videoRef);

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, url }),
    };
  } catch (error) {
    console.error("Erro detalhado:", error.code, error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: error.message }),
    };
  }
};
