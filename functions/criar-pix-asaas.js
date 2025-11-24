const axios = require("axios");

exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Método não permitido" };
  }

  const { valor, tipo, userId } = JSON.parse(event.body);

  try {
    const response = await axios.post(
      "https://api.asaas.com/v3/payments",
      {
        customer: "cus_000006049802",
        billingType: "PIX",
        value: valor,
        dueDate: new Date(Date.now() + 10 * 60 * 1000).toISOString().split("T")[0],
        description: `Lembrete ${tipo} - ${userId}`,
      },
      {
        headers: {
          "Content-Type": "application/json",
          access_token: "$aact_YTU5YTE0M2M2N2I4NjE3ZTYxYWM1M2ZmN2YxM2IyMGU3ZjA0ZWIwYTU4ZDk0N2QzM2QwMGRlM2Q0ZjU3MGRiZDJkOjAwMDAwMDAwMDAwMDAwODAyNTMkJGRhNzE5Y2U5LTAwYjUtNGU5Ni04M2QyLTU3ZDA5NzRhN2I3YQ==",
        },
      }
    );

    const data = response.data;

    const qrResponse = await axios.get(
      `https://api.asaas.com/v3/payments/${data.id}/pixQrCode`,
      {
        headers: {
          access_token: "$aact_YTU5YTE0M2M2N2I4NjE3ZTYxYWM1M2ZmN2YxM2IyMGU3ZjA0ZWIwYTU4ZDk0N2QzM2QwMGRlM2Q0ZjU3MGRiZDJkOjAwMDAwMDAwMDAwMDAwODAyNTMkJGRhNzE5Y2U5LTAwYjUtNGU5Ni04M2QyLTU3ZDA5NzRhN2I3YQ=="
        }
      }
    );

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        qrCodeUrl: qrResponse.data.qrCodeUrl,
        copiaECola: qrResponse.data.payload,
        paymentId: data.id,
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
