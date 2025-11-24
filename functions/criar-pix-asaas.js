const axios = require("axios");

exports.handler = async (event) => {
  const { valor, tipo, userId } = JSON.parse(event.body || "{}");

  // ←←← TROQUE AQUI PELA SUA CHAVE SANDBOX (copie com o botão do Asaas)
  const ASAAS_KEY = "$aact_COLOQUE_SUA_CHAVE_SANDBOX_AQUI";

  try {
    const cliente = await axios.post("https://api.asaas.com/v3/customers", {
      name: "Cliente Pix",
      cpfCnpj: "24994055093",
      mobilePhone: "47999999999"
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
