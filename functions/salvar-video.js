// netlify/functions/salvar-video.js
exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405 };

  try {
    const { videoBase64, gravacaoId } = JSON.parse(event.body);
    const base64Data = videoBase64.split(',')[1];
    const buffer = Buffer.from(base64Data, 'base64');

    const filename = `videos/video_${gravacaoId}.webm`;

    // Salva no Firebase Storage (sem CORS porque é server-side)
    const { storage } = require('firebase-admin/storage');
    const { initializeApp, getApps } = require('firebase-admin/app');

    if (!getApps().length) {
      initializeApp({
        credential: require('firebase-admin/credential').cert(JSON.parse(process.env.FIREBASE_ADMIN_SDK)),
        storageBucket: 'deixacomigo-727ff.appspot.com'
      });
    }

    const bucket = storage().bucket();
    const file = bucket.file(filename);
    await file.save(buffer, { contentType: 'video/webm' });
    await file.makePublic();

    const url = `https://storage.googleapis.com/deixacomigo-727ff.appspot.com/${filename}`;

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, url })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: error.message })
    };
  }
};
