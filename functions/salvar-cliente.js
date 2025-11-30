exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Método não permitido" };
  }

  try {
    const dados = JSON.parse(event.body);

    // Simula salvar no banco (na real vai pro Firestore depois)
    console.log("Cliente recebido:", dados);

    // Gera um ID fake só pra frente continuar funcionando
    const fakeId = "cli_" + Date.now();

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        success: true,
        clienteId: fakeId,
        mensagem: "Cliente salvo (modo teste)"
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        success: false,
        error: "Erro interno"
      }),
    };
  }
};
