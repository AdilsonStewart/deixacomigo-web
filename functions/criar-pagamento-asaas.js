// functions/criar-pagamento-asaas.js
const admin = require("firebase-admin");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)),
  });
}
const db = admin.firestore();

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: "Método não permitido" };
  }

  try {
    const { valor, tipo, metodo, pedidoId, telefone, nome } = JSON.parse(event.body || "{}");

    if (!valor || !tipo || !metodo || !pedidoId) {
      return { statusCode: 400, headers, body: JSON.stringify({ success: false, error: "Dados faltando" }) };
    }

    const ASAAS_API_KEY = process.env.ASAAS_API_KEY;
    if (!ASAAS_API_KEY) throw new Error("Chave Asaas não configurada");

    // Salva o pedido
    await db.collection("pedidos").doc(pedidoId).set({
      pedidoId,
      nome: nome || "Anônimo",
      telefone: telefone || "11988265000",
      valor,
      tipo,
      metodo,
      status: "AGUARDANDO_PAGAMENTO",
      usado: false,
      criadoEm: admin.firestore.FieldValue.serverTimestamp(),
    });

    const asaasHeaders = { "access_token": ASAAS_API_KEY, "Content-Type": "application/json" };

    // ===================== PIX =====================
    if (metodo === "PIX") {
      // Cliente mínimo (sem endereço)
      const clienteRes = await fetch("https://api.asaas.com/v3/customers", {
        method: "POST",
        headers: asaasHeaders,
        body: JSON.stringify({
          name: nome || "Adilson Stewart",
          cpfCnpj: "04616557802",
          email: "adilson@deixacomigo.com",
          mobilePhone: telefone || "11988265000",
          notificationDisabled: false,
        }),
      });
      const cliente = await clienteRes.json();
      if (cliente.errors) throw new Error("Cliente: " + JSON.stringify(cliente.errors));

      const vencimento = new Date();
      vencimento.setDate(vencimento.getDate() + 3);

      const pagamentoRes = await fetch("https://api.asaas.com/v3/payments", {
        method: "POST",
        headers: asaasHeaders,
        body: JSON.stringify({
          customer: cliente.id,
          billingType: "PIX",
          value: Number(valor),
          dueDate: vencimento.toISOString().split("T")[0],
          description: "DeixaComigo - Áudio ou Vídeo 30s",
          externalReference: pedidoId,
        }),
      });
      const pagamento = await pagamentoRes.json();
      if (pagamento.errors) throw new Error(pagamento.errors[0].description);

      const qrRes = await fetch(`https://api.asaas.com/v3/payments/${pagamento.id}/pixQrCode`, {
        headers: asaasHeaders,
      });
      const qr = await qrRes.json();
      if (qr.errors) throw new Error("QR: " + JSON.stringify(qr.errors));

      await db.collection("pedidos").doc(pedidoId).update({
        asaasPaymentId: pagamento.id,
      });

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          pedidoId,
          qrCodeBase64: qr.encodedImage,
          copiaECola: qr.payload,
        }),
      };
    }

    // ===================== CARTÃO =====================
    if (metodo === "CREDIT_CARD") {
      const linkRes = await fetch("https://api.asaas.com/v3/paymentLinks", {
        method: "POST",
        headers: asaasHeaders,
        body: JSON.stringify({
          name: `DeixaComigo – ${tipo === "áudio" ? "Áudio" : "Vídeo"} 30s`,
          value: Number(valor),
          billingType: "CREDIT_CARD",
          chargeType: "DETACHED",
          externalReference: pedidoId,
        }),
      });
      const link = await linkRes.json();
      if (link.errors) throw new Error(link.errors[0].description);

      await db.collection("pedidos").doc(pedidoId).update({ asaasPaymentId: link.id });

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, pedidoId, checkoutUrl: link.url }),
      };
    }

    return { statusCode: 400, headers, body: JSON.stringify({ success: false, error: "Método inválido" }) };

  } catch (error) {
    console.error("Erro Asaas:", error.message);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, error: error.message }),
    };
  }
};
