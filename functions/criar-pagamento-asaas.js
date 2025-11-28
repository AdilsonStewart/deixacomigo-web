// functions/criar-pagamento-asaas.js  ←  VERSÃO MÍNIMA SÓ PRA VER O QR CODE
exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  if (event.httpMethod !== "POST") return { statusCode: 405, headers, body: "Método não permitido" };

  try {
    const { valor, tipo, metodo, pedidoId } = JSON.parse(event.body || "{}");
    const ASAAS_API_KEY = process.env.ASAAS_API_KEY;

    const asaasHeaders = { "access_token": ASAAS_API_KEY, "Content-Type": "application/json" };

    // cria cliente direto
    const clienteRes = await fetch("https://sandbox.asaas.com/api/v3/customers", {
      method: "POST",
      headers: asaasHeaders,
      body: JSON.stringify({ name: "Teste", cpfCnpj: "04616557802", email: "teste@deixacomigo.com" }),
    });
    const cliente = await clienteRes.json();

    const vencimento = new Date();
    vencimento.setDate(vencimento.getDate() + 3);

    const pagamentoRes = await fetch("https://sandbox.asaas.com/api/v3/payments", {
      method: "POST",
      headers: asaasHeaders,
      body: JSON.stringify({
        customer: cliente.id,
        billingType: "PIX",
        value: Number(valor).toFixed(2),
        dueDate: vencimento.toISOString().split("T")[0],
        description: "DeixaComigo teste",
        externalReference: pedidoId || "teste123",
      }),
    });
    const pagamento = await pagamentoRes.json();
    if (pagamento.errors) throw new Error(pagamento.errors[0].description);

    const qrRes = await fetch(`https://sandbox.asaas.com/api/v3/payments/${pagamento.id}/pixQrCode`, { headers: asaasHeaders });
    const qr = await qrRes.json();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        qrCodeBase64: qr.encodedImage,
        copiaECola: qr.payload,
      }),
    };
  } catch (error) {
    return { statusCode: 500, headers, body: JSON.stringify({ success: false, error: error.message }) };
  }
};
