import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Sucesso.css'; // Mantenha isso se você tiver o arquivo CSS, mas vamos adicionar estilos inline para melhorar o visual

export default function Sucesso() {
  const navigate = useNavigate();
  useEffect(() => {
    // ✅ REDIRECIONAMENTO AUTOMÁTICO APÓS 3 SEGUNDOS
    const timer = setTimeout(() => {
      const tipoServico = localStorage.getItem('tipoServico');
      const destino = tipoServico === 'vídeo' ? '/videorecorder' : '/audiorecorder';
      navigate(destino);
    }, 3000);
    return () => clearTimeout(timer);
  }, [navigate]);

  const tipoServico = localStorage.getItem('tipoServico');
  const destino = tipoServico === 'vídeo' ? '/videorecorder' : '/audiorecorder';

  return (
    <div 
      className="container sucesso-container"
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh', // Ocupa a tela inteira verticalmente
        backgroundColor: '#f0f8ff', // Fundo azul claro suave
        fontFamily: 'Arial, sans-serif', // Fonte limpa
      }}
    >
      <div 
        className="sucesso-card"
        style={{
          backgroundColor: '#ffffff', // Fundo branco para o card
          borderRadius: '15px', // Bordas arredondadas
          padding: '40px', // Espaçamento interno
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', // Sombra suave para profundidade
          textAlign: 'center', // Centraliza o texto
          maxWidth: '400px', // Largura máxima para não ficar solto
          width: '100%', // Responsivo
        }}
      >
        {/* ✅ OLHINHO DE CORAÇÃO FOFO - Aumentado e com cor */}
        <div 
          className="sucesso-icon"
          style={{
            fontSize: '60px', // Maior para destaque
            marginBottom: '20px',
          }}
        >
          😍
        </div>
        
        <h1 
          className="sucesso-titulo"
          style={{
            color: '#4CAF50', // Verde sucesso
            fontSize: '32px', // Tamanho maior
            marginBottom: '10px',
          }}
        >
          PARABÉNS!
        </h1>
        
        <p 
          className="sucesso-mensagem"
          style={{
            fontSize: '18px',
            color: '#333',
            marginBottom: '15px',
          }}
        >
          Sua compra foi aprovada com sucesso!
        </p>
        
        <p 
          className="sucesso-detalhes"
          style={{
            fontSize: '16px',
            color: '#666',
            marginBottom: '20px',
          }}
        >
          Agora é hora de gravar sua mensagem especial com todo carinho!
        </p>
        
        <p 
          className="sucesso-redirecionamento"
          style={{
            fontSize: '14px',
            color: '#888',
            marginBottom: '25px',
          }}
        >
          Redirecionando para gravação em 3 segundos...
        </p>
        
        {/* ✅ BOTÃO COM EMOJI FOFO - Estilizado para ser mais atraente */}
        <button
          className="botao botao-sucesso"
          onClick={() => navigate(destino)}
          style={{
            backgroundColor: '#4CAF50', // Verde botão
            color: '#ffffff', // Texto branco
            border: 'none',
            borderRadius: '8px',
            padding: '12px 24px',
            fontSize: '16px',
            cursor: 'pointer',
            transition: 'background-color 0.3s', // Efeito suave ao hover
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#45a049'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#4CAF50'}
        >
          🎤 Gravar Minha Mensagem Agora
        </button>
      </div>
    </div>
  );
}
