export const handler = async (event) => {
  console.log("Webhook Asaas recebido:", event.body);
  return { statusCode: 200, body: "ok" };
};
