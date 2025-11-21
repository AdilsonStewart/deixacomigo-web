import { MercadoPagoConfig, Payment } from 'mercadopago';

export const handler = async (event) => {
  try {
    console.log("📩 EVENTO RECEBIDO:", event.body);

    const body = JSON.parse(event.body || '{}');
    const { valor, tipo } = body;

    console.log(`🎯 VALOR: ${valor} TIPO: ${tipo}`);

    if (!valor || !tipo) {
      return {
        statusCode: 400,
        body: JSON.stringify({ success: false, message: "Dados inválidos" })
      };
    }

    // CONFIGURA CLIENTE
    const client = new MercadoPagoConfig({
      accessToken: process.env.MP_ACCESS_TOKEN
    });

    const payment = new Payment(client);

    // CRIAR PAGAMENTO PIX
    const resposta = await payment.create({
      body: {
        transaction_amount: Number(valor),
        description: `Pagamento por ${tipo}`,
        payment_method_id: 'pix',
        payer: {
          email: "user@example.com"
        }
      }
    });

    console.log("💰 RESPOSTA MERCADO PAGO:", resposta);

    const copiaCola = resposta.point_of_interaction.transaction_data.qr_code;
    const qrBase64 = resposta.point_of_interaction.transaction_data.qr_code_base64;

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        success: true,
        copiaCola,
        qrBase64
      })
    };

  } catch (error) {
    console.error("🔥 ERRO NO SERVIDOR:", error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        message: error.message
      })
    };
  }
};
