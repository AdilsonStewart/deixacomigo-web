// netlify/functions/salvar-video.js
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyDB8f9oZ6Z7g3X5v8Y8vX5v8Y8vX5v8Y8v",
  authDomain: "deixacomigo-727ff.firebaseapp.com",
  projectId: "deixacomigo-727ff",
  storageBucket: "deixacomigo-727ff.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return { statusCode: 405 };

  try {
    // Pega o arquivo do FormData (o React manda como multipart)
    const form = new FormData();
    const boundary = event.headers["content-type"].match(/boundary=(.*)/)[1];
    const parts = event.body.split(`--${boundary}`);

    let videoBuffer = null;
    let filename = `video_${Date.now()}.webm`;

    for (const part of parts) {
      if (part.includes('name="video"') && part.includes("filename=")) {
        const headerEnd = part.indexOf("\r\n\r\n");
        const content = part.slice(headerEnd + 4, -2); // tira \r\n-- no final
        videoBuffer = Buffer.from(content, "binary");
        const match = part.match(/filename="(.+?)"/);
        if (match) filename = match[1];
      }
    }

    if (!videoBuffer) throw new Error("Vídeo não encontrado");

    const storageRef = ref(storage, `videos/${filename}`);
    await uploadBytes(storageRef, videoBuffer, { contentType: "video/webm" });
    const url = await getDownloadURL(storageRef);

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, url })
    };

  } catch (error) {
    console.error("Erro:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: error.message })
    };
  }
};
