import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Servicos.css';

export default function Servicos() {
  const navigate = useNavigate();

  // FUNÇÃO REAL DO MERCADO PAGO
  const iniciarPagamentoMercadoPago = async (valor, produto) => {
    try {
      // Carrega o SDK do Mercado Pago
      const script = document.createElement('script');
      script.src = 'https://sdk.mercadopago.com/js/v2';
      script.onload = () => {
        // Inicializa o Mercado Pago
        const mp = new window.MercadoPago(process.env.REACT_APP_MERCADOPAGO_PUBLIC_KEY);
        
        // CORREÇÃO: usar autoOpen em vez de .open()
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
          },
          autoOpen: true // ✅ CORREÇÃO AQUI!
        });
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
        onClick={() => iniciarPagamentoMercadoPago(1.99, 'Áudio')}
      >
        🎤 Gravar Áudio - R$ 1,99
      </button>

      <button 
        className="botao botao-video"
        onClick={() => iniciarPagamentoMercadoPago(1.99, 'Vídeo')}
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
