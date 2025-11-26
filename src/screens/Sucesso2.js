import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Sucesso2.css';

const Sucesso2 = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(3);

  console.log('🎬 Sucesso2 - Componente carregado');

  // ✅ REDIRECIONAMENTO AUTOMÁTICO APÓS 3 SEGUNDOS
  useEffect(() => {
    console.log('⏰ Sucesso2 - Iniciando contagem regressiva');
    
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          console.log('🚀 Sucesso2 - Redirecionando automaticamente para /videorecorder');
          navigate('/videorecorder');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      console.log('🧹 Sucesso2 - Limpando timer');
      clearInterval(timer);
    };
  }, [navigate]);

  const handleContinuar = () => {
    console.log('🎯 Sucesso2 - Botão Continuar clicado');
    navigate('/videorecorder');
  };

  return (
    <div className="sucesso2-container">
      <img
        className="sucesso2-gif"
        src="https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExbDg4aHBpM2V0cG50N2phN3R0M2txdzZkY3hucDJpN2gyNmlrYzV4NCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/26xBIygOcC3bAWg3S/giphy.gif"
        alt="Sucesso"
      />

      <h1>Pagamento Aprovado! 🎉</h1>
      <p className="sucesso-mensagem">
        Obrigado! Sua compra foi confirmada com sucesso.
      </p>
      
      <p className="contagem-regressiva">
        {countdown > 0 
          ? `Redirecionando automaticamente em ${countdown}...` 
          : "Redirecionando agora..."
        }
      </p>

      {/* ✅ BOTÃO CONTINUAR GRANDE E CLARO */}
      <button 
        className="botao-continuar"
        onClick={handleContinuar}
      >
        ▶️ Continuar para Gravação
      </button>

      <div className="instrucoes">
        <p>Clique em "Continuar" para iniciar a gravação do seu vídeo surpresa!</p>
      </div>
    </div>
  );
};

export default Sucesso2;
