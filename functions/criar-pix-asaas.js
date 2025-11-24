import axios from "axios";

export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const { valor, tipo, userId } = JSON.parse(event.body);

  try {
    const response = await axios.post(
      "https://api.asaas.com/v3/payments",
      {
        customer: "cus_000006049802", // cliente de teste do Asaas
        billingType: "PIX",
        value: valor,
        dueDate: new Date(Date.now() + 5 * 60000).toISOString().split("T")[0], // vence em 5 min
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

    return {
      statusCode: 200,
      body: JSON.stringify({
        {
          success: true,
          qrCodeUrl: data.qrCodeUrl || `https://api.asaas.com/v3/payments/${data.id}/pixQrCode`,
          copiaECola: data.encodedImage.replace("data:image/png;base64,", ""),
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
