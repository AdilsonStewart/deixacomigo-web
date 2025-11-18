const mercadopago = require('mercadopago');

exports.handler = async (event) => {
  // Configura o Mercado Pago
  mercadopago.configure({
    access_token: process.env.MERCADOPAGO_ACCESS_TOKEN
  });

  try {
    const { valor, produto } = JSON.parse(event.body);
    
    const preference = {
      items: [
        {
          title: `Lembrete em ${produto} - DeixaComigo`,
          unit_price: parseFloat(valor),
          quantity: 1,
        }
      ],
      back_urls: {
        success: "https://deixacomigoweb.netlify.app/sucesso",
        failure: "https://deixacomigoweb.netlify.app/erro", 
        pending: "https://deixacomigoweb.netlify.app/erro"
      },
      auto_return: "approved",
    };

    const result = await mercadopago.preferences.create(preference);
    
    return {
      statusCode: 200,
      body: JSON.stringify({ id: result.body.id })
    };
    
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
