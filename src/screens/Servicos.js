import React from "react";
import { useNavigate } from "react-router-dom";
import "./Servicos.css";

export default function Servicos() {
  const navigate = useNavigate();

  const iniciarPagamento = async (valor, tipo) => {
    try {
      const response = await fetch("/.netlify/functions/criar-pagamento", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ valor, tipo })
      });

      const data = await response.json();

      if (!data.success) {
        alert("Erro ao criar pagamento no servidor.");
        return;
      }

      // Redireciona para o pagamento do Mercado Pago
      window.location.href = data.init_point;

    } catch (error) {
      console.error("Erro:", error);
      alert("Falha ao iniciar pagamento. Tente novamente.");
    }
  };

  return (
    <div className="container">
      <h1 className="titulo">Escolha seu Lembrete</h1>
      <p className="slogan">Como você quer lembrar?</p>

      <button
        className="botao botao-audio"
        onClick={() => iniciarPagamento(1.99, "Áudio")}
      >
        🎤 Gravar Áudio (30s) - R$ 1,99
      </button>

      <button
        className="botao botao-video"
        onClick={() => iniciarPagamento(4.99, "Vídeo")}
      >
        🎥 Gravar Vídeo (30s) - R$ 4,99
      </button>

      <button className="botao botao-imagem" disabled>
        📸 Anexar Imagem - Em breve
      </button>

      <button className="voltar-text" onClick={() => navigate('/')}>
        ← Voltar para Início
      </button>
    </div>
  );
}
