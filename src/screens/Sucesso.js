import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Sucesso.css';

export default function Sucesso() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/audiorecorder');
    }, 3000);
    return () => clearTimeout(timer);
  }, [navigate]);

  const destino = '/audiorecorder';

  return (
    <div 
      className="container sucesso-container"
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f0f8ff',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <div 
        className="sucesso-card"
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '15px',
          padding: '40px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
          textAlign: 'center',
          maxWidth: '400px',
          width: '100%',
        }}
      >
        <div 
          className="sucesso-icon"
          style={{
            fontSize: '60px',
            marginBottom: '20px',
          }}
        >
          😍
        </div>

        <h1 
          className="sucesso-titulo"
          style={{
            color: '#4CAF50',
            fontSize: '32px',
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
          Agora vamos gravar sua mensagem especial!
        </p>

        <p 
          className="sucesso-redirecionamento"
          style={{
            fontSize: '14px',
            color: '#888',
            marginBottom: '25px',
          }}
        >
          Redirecionando em 3 segundos...
        </p>

        <button
          onClick={() => navigate(destino)}
          style={{
            backgroundColor: '#4CAF50',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            padding: '12px 24px',
            fontSize: '16px',
            cursor: 'pointer',
            transition: 'background-color 0.3s',
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
