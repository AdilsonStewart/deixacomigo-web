const salvar = async () => {
  if (!recordedBlob) return;

  const filename = `video_${gravacaoId}.webm`;

  const reader = new FileReader();
  reader.onload = async () => {
    const base64 = reader.result;

    try {
      const response = await fetch('/.netlify/functions/upload-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoBase64: base64, filename })
      });

      const data = await response.json();

      if (data.url) {
        localStorage.setItem('lastRecordingUrl', data.url);
        alert('Vídeo enviado com sucesso! Já pode agendar');
        navigate('/agendamento');
      } else {
        alert('Erro ao enviar: ' + (data.error || 'Tenta novamente'));
      }
    } catch (err) {
      console.error(err);
      alert('Erro de conexão. Tenta novamente.');
    }
  };

  reader.readAsDataURL(recordedBlob);
};
