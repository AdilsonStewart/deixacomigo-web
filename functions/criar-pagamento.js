// netlify/functions/criar-pagamento.js
export const handler = async (event) => {
  if (event.httpMethod !== "POST") return { statusCode: 405 };

  try {
    const body = JSON.parse(event.body || "{}");
    const { valor, tipo, metodo = "pix" } = body;

    if (!valor || !tipo) {
      return { statusCode: 400, body: JSON.stringify({ success: false, error: "Faltou valor ou tipo" }) };
    }

    const valorCorrigido = Number(Number(valor).toFixed(2));
    const isBarato = valorCorrigido === 4.99;

    // CLIENTE FIXO (pra teste – depois você pode pegar do formulário)
    const customerPayload = {
      name: "Cliente Teste",
      cpfCnpj: "24971563792",         // CPF válido pra teste
      email: "teste@deixacomigo.com",
      phone: "11999999999",
      mobilePhone: "11999999999"
    };

    // Primeiro cria o customer
    const customerRes = await fetch("https://api.asaas.com/v3/customers", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "access_token": process.env.ASAAS_API_KEY
      },
      body: JSON.stringify(customerPayload)
    });

    const customerData = await customerRes.json();

    const payload = {
      customer: customerData.id || customerData.object?.id,
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

    const res = await fetch("https://api.asaas.com/v
