// netlify/functions/upload-video.js
const { Storage } = require('@google-cloud/storage');

// Inicializa com a service account que tá no ambiente
const storage = new Storage({
  projectId: 'deixacomigo-727ff',
  credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS)
});

const bucket = storage.bucket('deixacomigo-727ff.appspot.com');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405 };

  try {
    const { videoBase64, filename } = JSON.parse(event.body);
    const buffer = Buffer.from(videoBase64.split(',')[1], 'base64');

    const file = bucket.file(`videos/${filename}`);
    await file.save(buffer, {
      metadata: { contentType: 'video/webm' },
      public: true
    });

    const publicUrl = `https://storage.googleapis.com/deixacomigo-727ff.appspot.com/videos/${filename}`;

    return {
      statusCode: 200,
      body: JSON.stringify({ url: publicUrl })
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
