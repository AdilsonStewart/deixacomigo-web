import { useState } from 'react';

export default function TesteClickSend() {
  const [resultado, setResultado] = useState('');

  const testarClickSend = async () => {
    try {
      setResultado('Enviando...');
      
      const response = await fetch('/.netlify/functions/verificar-mensagens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teste: true,
          telefone: '+5511999999999', // SEU NÚMERO
          mensagem: '🚀 TESTE FUNCIONOU! Firebase + Netlify + ClickSend OK!'
        })
      });
      
      const data = await response.json();
      setResultado(JSON.stringify(data, null, 2));
    } catch (error) {
      setResultado('ERRO: ' + error.message);
    }
  };

  return (
    <div style={{ padding: '50px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>🧪 TESTE CLICK SEND</h1>
      <button 
        onClick={testarClickSend}
        style={{
          padding: '15px 30px',
          fontSize: '18px',
          background: '#ff6b6b',
          color: 'white',
          border: 'none',
          borderRadius: '10px',
          cursor: 'pointer'
        }}
      >
        🔥 CLICAR PRA TESTAR AGORA!
      </button>
      
      <pre style={{ 
        background: '#f5f5f5', 
        padding: '20px', 
        marginTop: '20px',
        borderRadius: '10px',
        whiteSpace: 'pre-wrap'
      }}>
{resultado}
      </pre>
    </div>
  );
}
