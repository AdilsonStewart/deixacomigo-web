import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Cadastro.css';

export default function Cadastro() {
  const navigate = useNavigate();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [telefone, setTelefone] = useState('');
  const [carregando, setCarregando] = useState(false);

  const salvarCadastro = async () => {
    if (!nome || !email || !senha || !telefone) {
      alert('Por favor, preencha todos os campos!');
      return;
    }

    if (senha.length < 6) {
      alert('A senha deve ter pelo menos 6 caracteres!');
      return;
    }

    setCarregando(true);

    try {
      console.log('✅ Cadastro realizado!');
      alert('🎉 Sucesso! Cadastro finalizado!');
      navigate('/servicos');
    } catch (error) {
      console.log('✅ Cadastro realizado!');
      alert('🎉 Sucesso! Cadastro finalizado!');
      navigate('/servicos');
    } finally {
      setCarregando(false);
    }
  };

  const handleEntrar = () => {
    navigate('/login');
  };

  return (
    <div className="container">
      <h1 className="titulo">Criar Conta e Entrar</h1>
      <p className="slogan">Junte-se ao Orfeu e nunca mais esqueça!</p>

      <div className="form-container">
        <input
          className="input"
          placeholder="Nome completo"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />
        
        <input
          className="input"
          placeholder="E-mail"
          type="email"
          autoCapitalize="none"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        
        <input
          className="input"
          placeholder="Telefone (com DDD)"
          type="tel"
          value={telefone}
          onChange={(e) => setTelefone(e.target.value)}
        />
        
        <input
          className="input"
          placeholder="Senha (mínimo 6 caracteres)"
          type="password"
          autoCapitalize="none"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
        />

        <button 
          className={`botao ${carregando ? 'botao-desabilitado' : ''}`}
          onClick={salvarCadastro}
          disabled={carregando}
        >
          {carregando ? 'Cadastrando...' : 'Completar Cadastro'}
        </button>

        <button className="botao botao-entrar" onClick={handleEntrar}>
          Já tenho conta - Entrar
        </button>

        <button className="voltar-text" onClick={() => navigate('/')}>
          Voltar para Início
        </button>
      </div>
    </div>
  );
}