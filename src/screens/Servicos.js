import React, { useState } from 'react';
import './Servicos.css';

const Servicos = () => {
  // Estado pra guardar o método de pagamento escolhido
  const [metodo, setMetodo] = useState('pix'); // padrão = PIX (mais rápido)

  const criarPagamento = async (valor, tipo) => {
    try {
      console.log(`Chamando pagamento: ${tipo} R$${valor} via ${metodo}`);

      const response = await fetch("/.netlify/functions/criar-pagamento", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          valor, 
          tipo, 
          metodo // "pix" ou "cartao"
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Erro no servidor");
      }

      // Abre direto a página de pagamento do Asaas (PIX ou Cartão)
      window.location.href = data.paymentLink;

    } catch (error) {
      console.error("Erro:", error);
      alert("Ops! Algo deu errado. Tente novamente ou escolha outro método.");
    }
  };

  return (
    <div className="servicos-container">
      <img
        src="https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExZ3dqMDloZHlsM2sxY3RrMHQ3cjluYzBpYjlwNXFqNmI2ZXF1NjUxdCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/rKYYa2fMQNRfBwvtZJ/giphy.gif"
        alt="Serviços"
        className="servicos-gif"
      />

      <h1 className="titulo">Escolha seu serviço</h1>

      {/* Opções de áudio e vídeo */}
      <div style={{ margin: "20px 0" }}>

        <button
          className="botao botao-audio"
          style={{ margin: "10px", padding: "15px 30px", fontSize: "1.2rem" }}
          onClick={() => criarPagamento(1.99, "áudio")}
        >
          Áudio 30s — R$ 1,99
        </button>

        <button
          className="botao botao-video"
          style={{ margin: "10px", padding: "15px 30px", fontSize: "1.2rem" }}
          onClick={() => criarPagamento(4.99, "vídeo")}
        >
          Vídeo 30s — R$ 4,99
        </button>
      </div>

      {/* Escolha de método de pagamento */}
      <div style={{ margin: "30px 0", color: "white", fontSize: "1.1rem" }}>
        <p>Como você quer pagar?</p>

        <label style={{ margin: "0 15px", cursor: "pointer" }}>
          <input
            type="radio"
            name="metodo"
            value="pix"
            checked={metodo === 'pix'}
            onChange={(e) => setMetodo(e.target.value)}
          />{' '}
          PIX (mais rápido)
        </label>

        <label style={{ margin: "0 15px", cursor: "pointer" }}>
          <input
            type="radio"
            name="metodo"
            value="cartao"
            checked={metodo === 'cartao'}
            onChange={(e) => setMetodo(e.target.value)}
          />{' '}
          Cartão de Crédito
        </label>
      </div>

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
