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
    const { valor, tipo, metodo, pedidoId } = JSON.parse(event.body || "{}");

    if (!valor || !tipo || !metodo || !pedidoId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, error: "Dados incompletos" }),
      };
    }

    const ASAAS_API_KEY = process.env.ASAAS_API_KEY;
    if (!ASAAS_API_KEY) {
      throw new Error("ASAAS_API_KEY não configurada no Netlify");
    }

    // Salvar pedido no Firestore ANTES de criar no Asaas
    await db.collection("pedidos").doc(pedidoId).set({
      pedidoId,
      valor,
      tipo,
      metodo,
      status: "PENDENTE",
      criadoEm: admin.firestore.FieldValue.serverTimestamp(),
      asaasPaymentId: null,
    });

    // Cabeçalho comum pro Asaas
    const asaasHeaders = {
      "Content-Type": "application/json",
      "access_token": ASAAS_API_KEY,
    };

    if (metodo === "PIX") {
      // 1. Criar cliente temporário
      const clienteRes = await fetch("https://api.asaas.com/v3/customers", {
        method: "POST",
        headers: asaasHeaders,
        body: JSON.stringify({
          name: "Cliente DeixaComigo",
          cpfCnpj: "00000000000", // Asaas aceita isso pra teste/sandbox
          notificationDisabled: true,
        }),
      });
      const cliente = await clienteRes.json();

      if (cliente.errors) throw new Error(cliente.errors[0].description);

      // 2. Criar pagamento PIX
      const vencimento = new Date();
      vencimento.setDate(vencimento.getDate() + 1);

      const pagamentoRes = await fetch("https://api.asaas.com/v3/payments", {
        method: "POST",
        headers: asaasHeaders,
        body: JSON.stringify({
          customer: cliente.id,
          billingType: "PIX",
          value: valor,
          dueDate: vencimento.toISOString().split("T")[0],
          description: `DeixaComigo - ${tipo} - ${pedidoId}`,
          externalReference: pedidoId, // SUPER IMPORTANTE pro webhook
        }),
      });

      const pagamento = await pagamentoRes.json();
      if (pagamento.errors) throw new Error(pagamento.errors[0].description);

      // 3. Pegar QR Code
      const qrRes = await fetch(
        `https://api.asaas.com/v3/payments/${pagamento.id}/pixQrCode`,
        { headers: asaasHeaders }
      );
      const qr = await qrRes.json();

      // Atualizar no Firestore com o ID do Asaas
      await db.collection("pedidos").doc(pedidoId).update({
        asaasPaymentId: pagamento.id,
        status: "AGUARDANDO_PAGAMENTO",
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

    // ========== CARTÃO ==========
    if (metodo === "CREDIT_CARD") {
      const linkRes = await fetch("https://api.asaas.com/v3/paymentLinks", {
        method: "POST",
        headers: asaasHeaders,
        body: JSON.stringify({
          name: `DeixaComigo - ${tipo}`,
          description: `Pedido ${pedidoId}`,
          value: valor,
          billingType: "CREDIT_CARD",
          chargeType: "DETACHED", // permite cartão sem boleto
          dueDateLimitDays: 3,
          externalReference: pedidoId,
        }),
      });

      const linkData = await linkRes.json();

      if (linkData.errors) throw new Error(linkData.errors[0].description);

      await db.collection("pedidos").doc(pedidoId).update({
        asaasPaymentId: linkData.id,
        status: "AGUARDANDO_PAGAMENTO",
      });

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          pedidoId,
          checkoutUrl: linkData.url,
        }),
      };
    }

    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ success: false, error: "Método inválido" }),
    };
  } catch (error) {
    console.error("Erro na function:", error.message);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: error.message || "Erro interno",
      }),
    };
  }
};
