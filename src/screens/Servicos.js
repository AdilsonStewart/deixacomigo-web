import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Servicos.css';

export default function Servicos() {
  const navigate = useNavigate();

  // AGORA VAI PARA O MERCADO PAGO!
  const abrirPagamentoAudio = async () => {
    console.log('💰 Indo para Mercado Pago - Áudio R$ 1,99');
    // Aqui vai a integração com Mercado Pago
    iniciarPagamentoMercadoPago(1.99, 'audio');
  };

  const abrirPagamentoVideo = async () => {
    console.log('💰 Indo para Mercado Pago - Vídeo R$ 1,99');
    // Aqui vai a integração com Mercado Pago  
    iniciarPagamentoMercadoPago(1.99, 'video');
  };

  // FUNÇÃO DO MERCADO PAGO (vamos criar agora)
  const iniciarPagamentoMercadoPago = (valor, tipo) => {
    // Isso vai redirecionar para o checkout do Mercado Pago
    // E depois voltar automaticamente para /sucesso ou /erro
    console.log(`Iniciando pagamento: R$ ${valor} para ${tipo}`);
    
    // POR ENQUANTO: Simula redirecionamento pro Mercado Pago
    // DEPOIS: Vamos integrar com a API real
    alert(`🚀 REDIRECIONANDO PARA MERCADO PAGO!\nValor: R$ ${valor}\nTipo: ${tipo}`);
    
    // Simula o processo de pagamento
    setTimeout(() => {
      // 90% de chance de sucesso, 10% de erro (para teste)
      if (Math.random() > 0.1) {
        navigate('/sucesso');
      } else {
        navigate('/erro');
      }
    }, 2000);
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
