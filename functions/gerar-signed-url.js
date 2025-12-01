// netlify/functions/gerar-signed-url.js
const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_ADMIN_SDK)),
    storageBucket: 'deixacomigo-727ff.appspot.com'
  });
}

const bucket = admin.storage().bucket();

exports.handler = async (event) => {
  const { filename } = JSON.parse(event.body);

  const file = bucket.file(`videos/${filename}`);

  const [url] = await file.getSignedUrl({
    version: 'v4',
    action: 'write',
    expires: Date.now() + 15 * 60 * 1000, // 15 minutos
    contentType: 'video/webm'
  });

  return {
    statusCode: 200,
    body: JSON.stringify({ url })
  };
};
