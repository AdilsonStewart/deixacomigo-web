export const handler = async (event) => {
  if (event.httpMethod !== "POST") return { statusCode: 405 };

  try {
    const { valor, tipo, metodo } = JSON.parse(event.body); // novo campo "metodo"

    const descricao = tipo === "video" 
      ? "Mensagem em Vídeo Surpresa" 
      : "Mensagem em Áudio Surpresa";

    const valorNum = Number(valor);
    const isBarato = valorNum === 4.99;

    const payload = {
      value: valorNum,
      dueDate: new Date(Date.now() + 24*60*60*1000).toISOString().split("T")[0],
      description: descricao,
      externalReference: `surpresa-${Date.now()}`,
      billingType: metodo === "cartao" ? "CREDIT_CARD" : "PIX", // aqui decide
      callback: {
        successUrl: isBarato 
          ? "https://deixacomigoweb.netlify.app/sucesso2"
          : "https://deixacomigoweb.netlify.app/sucesso",
        autoRedirect: true
      }
    };

    const res = await fetch("https://api.asaas.com/v3/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "access_token": process.env.ASAAS_API_KEY
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (!res.ok) {
      return { statusCode: 400, body: JSON.stringify({ success: false, error: data }) };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        paymentLink: `https://pay.asaas.com/${data.id}`,
        qrCode: data.pix?.qrCodeImage || null,
        copiaECola: data.pix?.payload || null
      })
    };

  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ success: false, error: err.message }) };
  }
};
