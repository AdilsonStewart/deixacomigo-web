const express = require('express');
const router = express.Router();

// Rota POST /upload (mudei de '/' para '/upload')
router.post('/upload', async (req, res) => {
  try {
    const { audioBase64 } = req.body;

    // Validação básica
    if (!audioBase64) {
      return res.status(400).json({ 
        success: false, 
        error: 'audioBase64 é obrigatório no corpo da requisição' 
      });
    }

    // Remove o prefixo data:audio/webm;base64, se existir
    const base64 = audioBase64.includes(',') 
      ? audioBase64.split(',')[1] 
      : audioBase64;
    
    const fileName = `audios/gravacao_${Date.now()}.webm`;

    // Upload para Firebase Storage
    await fetch(
      `https://firebasestorage.googleapis.com/v0/b/deixacomigo-727ff.appspot.com/o?name=${encodeURIComponent(fileName)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'audio/webm' },
        body: Buffer.from(base64, 'base64'),
      }
    );

    // URL de acesso ao arquivo
    const url = `https://firebasestorage.googleapis.com/v0/b/deixacomigo-727ff.appspot.com/o/${encodeURIComponent(fileName)}?alt=media`;

    // Resposta no mesmo formato
    return res.status(200).json({ 
      success: true, 
      url 
    });

  } catch (error) {
    console.error('Erro no upload:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

module.exports = router;
