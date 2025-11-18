import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Servicos.css';

export default function Servicos() {
  const navigate = useNavigate();

  // Função 100% simulada - não chama function
  const abrirPagamentoAudio = async () => {
    console.log('🔧 SIMULAÇÃO: Indo direto para sucesso');
    window.location.href = '/sucesso';
  };

  const abrirPagamentoVideo = async () => {
    console.log('🔧 SIMULAÇÃO: Indo direto para sucesso');
    window.location.href = '/sucesso';
  };

  return (
    <div className="container">
      <h1 className="titulo">Escolha seu Lembrete</h1>
      <p className="slogan">Como você quer lembrar?</p>

      <button 
        className="botao botao-audio"
        onClick={abrirPagamentoAudio}
      >
        🎤 Gravar Áudio - R$ 1,99
      </button>

      <button 
        className="botao botao-video"
        onClick={abrirPagamentoVideo}
      >
        🎥 Gravar Vídeo - R$ 1,99
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

