// netlify/functions/salvar-video.js → VERSÃO FINAL QUE SALVA DE VERDADE
const { initializeApp } = require("firebase/app");
const { getStorage, ref, uploadBytes, getDownloadURL } = require("firebase/storage");

const firebaseConfig = {
  apiKey: "AIzaSyDB8f9oZ6Z7g3X5v8Y8vX5v8Y8vX5v8Y8v",
  authDomain: "deixacomigo-727ff.firebaseapp.com",
  projectId: "deixacomigo-727ff",
  storageBucket: "deixacomigo-727ff.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef1234567890"
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return { statusCode: 405 };

  try {
    // Converte o body bruto que o Netlify manda em Buffer
    const videoBuffer = Buffer.from(event.body, "binary");

    // Nome único do arquivo
    const filename = `videos/video_${Date.now()}_${Math.floor(Math.random() * 10000)}.webm`;
    const videoRef = ref(storage, filename);

    // Upload com metadados
    await uploadBytes(videoRef, videoBuffer, {
      contentType: "video/webm"
    });

    // URL pública real
    const url = await getDownloadURL(videoRef);

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, url })
    };

  } catch (error) {
    console.error("Erro no upload:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: error.message })
    };
  }
};
