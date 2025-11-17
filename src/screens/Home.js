import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="container">
      <p className="nao-esqueca">Não Esqueça Mais:</p>
      
      <div className="mascote-container">
        <img 
          src="https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExZTg0cXptZ2t1a3QxNTczY25xbzJ5bDA2MXFuMnRocWNzdXZvMHB0aSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/XpfXuBYtvR9I8jjBH0/giphy.gif"
          alt="Mascote DeixaComigo"
          className="mascote-image"
        />
      </div>
      
      <h1 className="titulo">DeixaComigo</h1>
      <p className="slogan">Lembrou agora?<br/>Programe o parabéns!</p>

      <button 
        className="botao criar-lembrete"
        onClick={() => navigate('/cadastro')}
      >
        Criar Meu Lembrete
      </button>

      <p className="texto-pequeno">
        Sua voz, na hora certa.<br/>Todo mundo acha que você nunca esquece.
      </p>
    </div>
  );
}