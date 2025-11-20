import React from 'react';
import './Servicos.css';

const Servicos = () => {
  const criarPagamento = async (valor, tipo) => {
    try {
      // ALERTA DE TESTE
      alert(`🚨 Teste: chamando criar-pagamento para ${tipo} R$${valor}`);

      const response = await fetch("/api/criar-pagamento", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ valor, tipo })
      });

      // Check pra evitar o erro de JSON (se for HTML de 404)
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Função não encontrada (404) - verifique o deploy');
      }

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Erro no servidor");
      }

      if (data.success && data.init_point) {
        window.location.href = data.init_point;
      } else {
        alert("Erro ao criar pagamento. Tente novamente.");
        console.error("Resposta inesperada:", data);
      }
    } catch (error) {
      console.error("Erro:", error);
      alert(error.message || "Houve um erro na comunicação com o servidor. Verifique sua conexão e tente novamente.");
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
        onClick={() => criarPagamento(1.99, "áudio")}
      >
        Áudio 30s — R$ 1,99
      </button>

      <button
        className="botao botao-video"
        onClick={() => criarPagamento(4.99, "vídeo")}
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
