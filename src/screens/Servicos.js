import React from 'react';
import './Servicos.css';

const Servicos = () => {

  // Função para chamar sua Function criar-pagamento
  const criarPagamento = async (valor, tipo) => {
    try {
      const response = await fetch("/.netlify/functions/criar-pagamento", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ valor, tipo })
      });

      const data = await response.json();

      if (data.init_point) {
        window.location.href = data.init_point; // Redireciona ao Mercado Pago
      } else {
        alert("Erro ao iniciar pagamento.");
      }
    } catch (error) {
      alert("Houve um erro na comunicação com o servidor.");
    }
  };

  return (
    <div className="servicos-container">
      <img 
        src="https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExZ3dqMDloZHlsM2sxY3RrMHQ3cjluYzBpYjlwNXFqNmI2ZXF1NjUxdCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/rKYYa2fMQNRfBwvtZJ/giphy.gif"
        alt="Serviços"
        className="servicos-gif"
      />

      <h1 className="titulo">Serviços</h1>

      <button 
        className="botao botao-audio"
        onClick={() => criarPagamento(1.99, "Áudio")}
      >
        Áudio 30s — R$ 1,99
      </button>

      <button 
        className="botao botao-video"
        onClick={() => criarPagamento(4.99, "Vídeo")}
      >
        Vídeo 30s — R$ 4,99
      </button>

      <button 
        className="botao voltar"
        onClick={() => window.history.back()}
      >
        Voltar
      </button>
    </div>
  );
};

export default Servicos;
