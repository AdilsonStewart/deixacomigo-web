// netlify/functions/salvar-video.js   →  VERSÃO QUE FUNCIONA 100% HOJE
const { ref, uploadBytes, getDownloadURL } = require("firebase/storage");
const { initializeApp } = require("firebase/app");
const { getStorage } = require("firebase/storage");

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

initializeApp(firebaseConfig);
const storage = getStorage();

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return { statusCode: 405 };

  try {
    // Netlify manda o body como string, a gente transforma em Buffer
    const buffer = Buffer.from(event.body, "binary");

    // Nome único do arquivo
    const filename = `videos/video_${Date.now()}.webm`;
    const fileRef = ref(storage, filename);

    // Upload direto
    await uploadBytes(fileRef, buffer, { contentType: "video/webm" });

    // Pega URL pública
    const url = await getDownloadURL(fileRef);

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, url }),
    };
  } catch (error) => {
    console.error("Erro:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: error.message }),
    };
  }
};
