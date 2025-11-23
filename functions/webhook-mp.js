export const handler = async (event) => {
  console.log("Pagamento confirmado pelo Mercado Pago");
  return {
    statusCode: 200,
    body: "ok"
  };
};
