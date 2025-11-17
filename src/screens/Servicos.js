import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Servicos.css';

export default function Servicos() {
  const navigate = useNavigate();

  // Função para abrir checkout REAL do Mercado Pago - ÁUDIO
  const abrirPagamentoAudio = async () => {
    try {
      const response = await fetch('/.netlify/functions/mercadopago-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          valor: 1.99,
          usuarioId: 'user-audio',
          tipo: "audio"
        })
      });

      const data = await response.json();
      
      if (data.success && data.init_point) {
        window.open(data.init_point, '_blank');
      } else {
        throw new Error('Erro ao criar pagamento áudio');
      }
      
    } catch (error) {
      // FALLBACK: Link direto se a function falhar
      const linkFallback = 'https://mpago.la/1ovRbA6';
      window.open(linkFallback, '_blank');
    }
  };

  // Função para abrir checkout REAL do Mercado Pago - VÍDEO
  const abrirPagamentoVideo = async () => {
    try {
      const response = await fetch('/.netlify/functions/mercadopago-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          valor: 1.99,
          usuarioId: 'user-video',
          tipo: "video"
        })
      });

      const data = await response.json();
      
      if (data.success && data.init_point) {
        window.open(data.init_point, '_blank');
      } else {
        throw new Error('Erro ao criar pagamento vídeo');
      }
      
    } catch (error) {
      // FALLBACK: Link direto se a function falhar
      const linkFallback = 'https://mpago.la/1RLYfUB';
      window.open(linkFallback, '_blank');
    }
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