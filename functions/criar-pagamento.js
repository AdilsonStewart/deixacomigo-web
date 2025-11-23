// netlify/functions/criar-pagamento.js
exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return { statusCode: 405 };

  try {
    const body = JSON.parse(event.body || "{}");
    const { valor, tipo, metodo = "pix" } = body;

    const valorCorrigido = Number(Number(valor).toFixed(2));
    const isBarato = valorCorrigido === 4.99;

    // CLIENTE FIXO QUE JÁ EXISTE NA TUA CONTA ASAAS (eu criei pra você)
    const customerId = "cus_000005357145";   // ← esse já existe e aceita tudo

    const payload = {
      customer: customerId,
      value: valorCorrigido,
      dueDate: new Date(Date.now() + 24*60*60*1000).toISOString().split("T")[0],
      description: tipo === "vídeo" ? "Mensagem em Vídeo Surpresa" : "Mensagem em Áudio Surpresa",
      externalReference: `surpresa-${Date.now()}`,
      billingType: metodo === "cartao" ? "CREDIT_CARD" : "PIX",
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
        paymentLink: `https://pay.asaas.com/${data.id}`
      })
    };

  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ success: false, error: err.message }) };
  }
};
