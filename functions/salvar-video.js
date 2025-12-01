// netlify/functions/salvar-video.js
const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_ADMIN_SDK)),
    storageBucket: 'deixacomigo-727ff.appspot.com'
  });
}

const bucket = admin.storage().bucket();

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { videoBase64, gravacaoId } = JSON.parse(event.body);
    const buffer = Buffer.from(videoBase64.split(',')[1], 'base64');

    const filename = `videos/video_${gravacaoId}.webm`;
    const file = bucket.file(filename);

    await file.save(buffer, {
      metadata: { contentType: 'video/webm' }
    });

    await file.makePublic();

    const url = `https://storage.googleapis.com/deixacomigo-727ff.appspot.com/${filename}`;

    return {
      statusCode: 200,
      body: JSON.stringify({ url })
    };
  } catch (error) {
    console.error('Erro:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
