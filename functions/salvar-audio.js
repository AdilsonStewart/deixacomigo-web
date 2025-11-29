exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return { statusCode: 405 };

  try {
    const { audioBase64 } = JSON.parse(event.body);

    const base64 = audioBase64.split(",")[1];
    const fileName = `audios/gravacao_${Date.now()}.webm`;

    await fetch(
      `https://firebasestorage.googleapis.com/v0/b/deixacomigo-727ff.appspot.com/o?name=${encodeURIComponent(fileName)}`,
      {
        method: "POST",
        headers: { "Content-Type": "audio/webm" },
        body: Buffer.from(base64, "base64"),
      }
    );

    const url = `https://firebasestorage.googleapis.com/v0/b/deixacomigo-727ff.appspot.com/o/${encodeURIComponent(fileName)}?alt=media`;

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, url }),
    };
  } catch (e) {
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: e.message }),
    };
  }
};
