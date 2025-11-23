const axios = require("axios");

exports.handler = async (event) => {
  try {
    const { valor, tipo, nome, cpf, email } = JSON.parse(event.body || "{}");

    if (!valor || !tipo || !nome || !cpf || !email) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          erro: "Campos obrigatórios: nome, cpf, email, valor e tipo"
        })
      };
    }

    // ✅ 1) Buscar cliente pelo CPF
    const search = await axios.get(
      `https://api.asaas.com/v3/customers?cpfCnpj=${cpf}`,
      {
        headers: {
          access_token: process.env.ASAAS_API_KEY
        }
      }
    );

    let customerId;

    if (search.data.totalCount > 0) {
      // ✅ já existe
      customerId = search.data.data[0].id;
    } else {
      // ✅ 2) criar cliente no Asaas
      const novo = await axios.post(
        "https://api.asaas.com/v3/customers",
        {
          name: nome,
          cpfCnpj: cpf,
          email: email
        },
        {
          headers: {
            access_token: process.env.ASAAS_API_KEY,
            "Content-Type": "application/json"
          }
        }
      );

      customerId = novo.data.id;
    }

    // ✅ 3) Criar pagamento PIX
    const pagamento = await axios.post(
      "https://api.asaas.com/v3/payments",
      {
        customer: customerId,
        billingType: "PIX",
        value: Number(valor),
        dueDate: new Date().toISOString().split("T")[0],
        description: `Mensageiro - ${tipo}`
      },
      {
        headers: {
          access_token: process.env.ASAAS_API_KEY,
          "Content-Type": "application/json"
        }
      }
    );

    // ✅ 4) Gerar QR Code
    const pix = await axios.get(
      `https://api.asaas.com/v3/payments/${pagamento.data.id}/pixQrCode`,
      {
        headers: {
          access_token: process.env.ASAAS_API_KEY
        }
      }
    );

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        pagamentoId: pagamento.data.id,
        copiaECola: pix.data.payload,
        qrCodeBase64: pix.data.encodedImage
      })
    };

  } catch (error) {
    console.error("Erro Asaas:", error.response?.data || error.message);

    return {
      statusCode: 500,
      body: JSON.stringify({
        erro: "Erro ao processar PIX",
        detalhes: error.response?.data || error.message
      })
    };
  }
};
