import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Servicos.css';

export default function Servicos() {
  const navigate = useNavigate();

  // INTEGRAÇÃO REAL COM MERCADO PAGO
  const abrirPagamentoAudio = async () => {
    await iniciarPagamentoMercadoPago(1.99, 'Áudio');
  };

  const abrirPagamentoVideo = async () => {
    await iniciarPagamentoMercadoPago(1.99, 'Vídeo');
  };

  // FUNÇÃO REAL DO MERCADO PAGO
  const iniciarPagamentoMercadoPago = async (valor, produto) => {
    try {
      // Carrega o SDK do Mercado Pago
      const script = document.createElement('script');
      script.src = 'https://sdk.mercadopago.com/js/v2';
      script.onload = () => {
        // Inicializa o Mercado Pago
        const mp = new window.MercadoPago(process.env.REACT_APP_MERCADOPAGO_PUBLIC_KEY);
        
        // Cria o checkout
        mp.checkout({
          preference: {
            items: [
              {
                title: `Lembrete em ${produto}`,
                unit_price: valor,
                quantity: 1,
              }
            ],
            back_urls: {
              success: `${window.location.origin}/sucesso`,
              failure: `${window.location.origin}/erro`,
              pending: `${window.location.origin}/erro`
            },
            auto_return: 'approved',
          }
        }).open();
      };
      document.body.appendChild(script);
      
    } catch (error) {
      console.error('Erro no Mercado Pago:', error);
      navigate('/erro');
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
