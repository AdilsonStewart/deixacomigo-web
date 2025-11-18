import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Servicos.css';

export default function Servicos() {
  const navigate = useNavigate();

  const iniciarPagamentoMercadoPago = async (valor, produto) => {
    console.log('🎯 BOTÃO CLICADO!', valor, produto);
    
    // SOLUÇÃO SIMPLES QUE FUNCIONA:
    alert(`🚀 REDIRECIONANDO PARA PAGAMENTO!\n\nProduto: ${produto}\nValor: R$ ${valor}\n\n(Integração real na próxima etapa)`);
    
    // Simula o processo de pagamento
    setTimeout(() => {
      // 90% de chance de sucesso (para teste)
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
