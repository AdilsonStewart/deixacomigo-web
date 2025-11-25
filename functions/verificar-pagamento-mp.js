export const handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json"
  };

  console.log("🔔 Function verificar-pagamento-mp chamada");

  if (event.httpMethod !== "POST") {
    return { 
      statusCode: 405, 
      headers,
      body: JSON.stringify({ success: false, error: "Método não permitido" }) 
    };
  }

  try {
    const body = JSON.parse(event.body || "{}");
    const { paymentId } = body;

    if (!paymentId) {
      return { 
        statusCode: 400, 
        headers,
        body: JSON.stringify({ success: false, error: "ID do pagamento não informado" }) 
      };
    }

    console.log("✅ Verificando pagamento:", paymentId);

    // ✅ CONSULTA O PAGAMENTO NO MERCADO PAGO
    const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${process.env.MP_ACCESS_TOKEN}`,
        "Content-Type": "application/json"
      }
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ Erro ao consultar pagamento:", data);
      return { 
        statusCode: 400, 
        headers,
        body: JSON.stringify({ success: false, error: data }) 
      };
    }

    console.log("✅ Status do pagamento:", data.status);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        status: data.status,
        value: data.transaction_amount,
        description: data.description,
        paymentDate: data.date_approved
      })
    };

  } catch (err) {
    console.error("❌ Erro na função:", err);
    return { 
      statusCode: 500, 
      headers,
      body: JSON.stringify({ success: false, error: err.message }) 
    };
  }
};
