const axios = require("axios");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Só POST" };
  }

  const { valor, tipo, userId } = JSON.parse(event.body || "{}");

  // TROQUE SÓ ISSO PELA SUA CHAVE SANDBOX (copie com botão do Asaas)
  const ASAAS_KEY = $aact_prod_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OjgzNzYzNWUxLWI4MzItNDMyYi04YTU1LTVkN2UxYmI4MWYzODo6JGFhY2hfNzU2M2JhY2QtMDgyMS00ZWE2LWEzZDYtNmUwYWE1MjU0ODlh;

  try {
    const cliente = await axios.post("https://api.asaas.com/v3/customers", {
      name: "Cliente Pix",
      cpfCnpj: "249.940.550-93",
      mobilePhone: "47 99999-9999"
    }, { headers: { access_token: ASAAS_KEY } });

    const pagamento = await axios.post("https://api.asaas.com/v3/payments", {
      customer: cliente.data.id,
      billingType: "PIX",
      value: valor,
      dueDate: new Date(Date.now() + 15*60*1000).toISOString().split("T")[0],
      description: `Lembrete ${tipo}`
    }, { headers: { access_token: ASAAS_KEY } });

    const qr = await axios.get(`https://api.asaas.com/v3/payments/${pagamento.data.id}/pixQrCode`, {
      headers: { access_token: ASAAS_KEY }
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        qrCodeUrl: qr.data.qrCodeUrl,
        copiaECola: qr.data.payload,
        paymentId: pagamento.data.id
      })
    };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ success: false, erro: e.message }) };
  }
};
