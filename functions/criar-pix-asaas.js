const axios = require("axios");

exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Método não permitido só POST" };
  }

  const { valor, tipo, userId } = JSON.parse(event.body);

  // COLE AQUI A SUA CHAVE SANDBOX DO ASAAS (começa com $aact_)
  const ASAAS_KEY = $aact_prod_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OjgzNzYzNWUxLWI4MzItNDMyYi04YTU1LTVkN2UxYmI4MWYzODo6JGFhY2hfNzU2M2JhY2QtMDgyMS00ZWE2LWEzZDYtNmUwYWE1MjU0ODlh;

  try {
    // 1. Cria cliente temporário
    const cliente = await axios.post(
      "https://api.asaas.com/v3/customers",
      {
        name: "Cliente Pix",
        cpfCnpj: "00000000191",
        email: "pix@temporario.com",
        mobilePhone: "47999999999",
      },
      { headers: { access_token: ASAAS_KEY } }
    );

    // 2. Cria o Pix
    const pagamento = await axios.post(
      "https://api.asaas.com/v3/payments",
      {
        customer: cliente.data.id,
        billingType: "PIX",
        value: valor,
        dueDate: new Date(Date.now() + 10 * 60 * 1000).toISOString().split("T")[0],
        description: `Lembrete ${tipo} - ${userId}`,
      },
      { headers: { access_token: ASAAS_KEY } }
    );

    // 3. Pega o QR Code
    const qr = await axios.get(
      `https://api.asaas.com/v3/payments/${pagamento.data.id}/pixQrCode`,
      { headers: { access_token: ASAAS_KEY } }
    );

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        qrCodeUrl: qr.data.qrCodeUrl,
        copiaECola: qr.data.payload,
        paymentId: pagamento.data.id,
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: error.response?.data || error.message,
      }),
    };
  }
};
