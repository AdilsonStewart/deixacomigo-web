exports.handler = async (event) =
  if (event.httpMethod !== 'POST') { 
    return { statusCode: 405, body: JSON.stringify({ error: 'MÇtodo n∆o permitido' }) }; 
  } 
 
  try { 
    const { valor, usuarioId, tipo = "audio" } = JSON.parse(event.body); 
    console.log('?? SIMULAÄ«O: Criando pagamento DeixaComigo:', { valor, usuarioId, tipo }); 
 
    // ?? SIMULAÄ«O PURA - N«O CHAMA MERCADO PAGO ?? 
    return { 
      statusCode: 200, 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({ 
        success: true, 
        init_point: 'https://deixacomigoweb.netlify.app/sucesso', 
        preference_id: 'simulacao-' + Date.now(), 
        sandbox_init_point: 'https://deixacomigoweb.netlify.app/sucesso' 
      }) 
    }; 
 
  } catch (error) { 
    console.error('Erro:', error); 
    return { statusCode: 500, body: JSON.stringify({ success: false, error: error.message }) }; 
  } 
}; 
