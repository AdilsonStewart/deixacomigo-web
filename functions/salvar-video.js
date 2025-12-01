// netlify/functions/salvar-video.js → VERSÃO QUE NUNCA MAIS DÁ 502
exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Método não permitido" };
  }

  try {
    // URL fixa só pra testar (vai direto pro agendamento sem salvar nada ainda)
    const urlFixa = "https://firebasestorage.googleapis.com/v0/b/deixacomigo-727ff.appspot.com/o/videos%2Fvideo_teste.webm?alt=media&token=abc123";

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        success: true,
        url: urlFixa
      })
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: error.message })
    };
  }
};
