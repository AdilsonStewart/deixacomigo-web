import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

export default function Home() {
  const navigate = useNavigate();
  const [showAdmin, setShowAdmin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [passwordError, setPasswordError] = useState(false);

  // Campos de data de nascimento SEM calendário
  const [dia, setDia] = useState('');
  const [mes, setMes] = useState('');
  const [ano, setAno] = useState('');

  // Senha do admin
  const ADMIN_PASSWORD = "123456";

  const handleAdminAccess = () => {
    if (adminPassword === ADMIN_PASSWORD) {
      navigate('/admin/painel');
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
      <p className="slogan">
        Lembrou agora?<br />Programe o parabéns!
      </p>

      {/* CAMPO DE NASCIMENTO SEM CALENDÁRIO */}
      <div className="data-container">
        <p className="label-data">Data de Nascimento</p>

        <div className="data-flex">
          <input
            type="text"
            placeholder="DD"
            maxLength="2"
            value={dia}
            onChange={(e) => setDia(e.target.value.replace(/\D/g, ''))}
            className="data-input"
          />

          <input
            type="text"
            placeholder="MM"
            maxLength="2"
            value={mes}
            onChange={(e) => setMes(e.target.value.replace(/\D/g, ''))}
            className="data-input"
          />

          <input
            type="text"
            placeholder="AAAA"
            maxLength="4"
            value={ano}
            onChange={(e) => setAno(e.target.value.replace(/\D/g, ''))}
            className="data-input"
          />
        </div>
      </div>

      {/* BOTÕES PRINCIPAIS */}
      <button
        className="botao criar-lembrete"
        onClick={() => navigate('/cadastro')}
      >
        Criar Meu Lembrete
      </button>

      <button
        className="botao criar-lembrete"
        style={{ marginTop: '10px', backgroundColor: '#4A90E2' }}
        onClick={() => navigate('/soucliente')}
      >
        Sou Cliente
      </button>

      <p className="texto-pequeno">
        Sua voz, na hora certa.<br />Todo mundo acha que você nunca esquece.
      </p>

      {/* ADMIN */}
      <div className="admin-centralizado">
        <button
          className="admin-btn-central"
          onClick={toggleAdmin}
        >
          {showAdmin ? '✖ Fechar Admin' : '⚙ Acesso Admin'}
        </button>

        {showAdmin && (
          <div className="admin-painel-central">
            <h3>Área Administrativa</h3>
            <input
              type="password"
              placeholder="Digite a senha admin"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              className="admin-input-central"
              onKeyPress={(e) => e.key === 'Enter' && handleAdminAccess()}
            />
            <button
              className="admin-btn-acessar"
              onClick={handleAdminAccess}
            >
              🔓 Acessar Painel
            </button>

            {passwordError && (
              <p className="admin-erro-central">Senha incorreta - Digite: 123456</p>
            )}

            <p className="admin-dica">Senha: 123456</p>
          </div>
        )}
      </div>
    </div>
  );
}
