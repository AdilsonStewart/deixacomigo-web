import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

export default function Home() {
  const navigate = useNavigate();
  const [showAdmin, setShowAdmin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [passwordError, setPasswordError] = useState(false);

  // Senha do admin (pode mudar depois)
  const ADMIN_PASSWORD = "deixacomigo2024";

  const handleAdminAccess = () => {
    if (adminPassword === ADMIN_PASSWORD) {
      navigate('/admin/audios');
    } else {
      setPasswordError(true);
      setAdminPassword('');
      setTimeout(() => setPasswordError(false), 3000);
    }
  };

  const toggleAdmin = () => {
    setShowAdmin(!showAdmin);
    setAdminPassword('');
    setPasswordError(false);
  };

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

      {/* ACESSO ADMIN DISCRETO */}
      <div className="admin-access">
        <button 
          className="admin-toggle"
          onClick={toggleAdmin}
        >
          {showAdmin ? '✖' : '⚙'}
        </button>
        
        {showAdmin && (
          <div className="admin-panel">
            <input
              type="password"
              placeholder="Senha admin"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              className="admin-input"
              onKeyPress={(e) => e.key === 'Enter' && handleAdminAccess()}
            />
            <button 
              className="admin-btn"
              onClick={handleAdminAccess}
            >
              Acessar
            </button>
            {passwordError && (
              <p className="admin-error">Senha incorreta</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
