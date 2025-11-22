exports.handler = async (event) => {
  console.log("Webhook MP recebido:", event.body);
  return { statusCode: 200, body: "OK" };
};
