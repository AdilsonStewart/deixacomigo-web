import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Cadastro.css';

export default function Cadastro() {
  const navigate = useNavigate();
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [nascimento, setNascimento] = useState(''); // formato: YYYY-MM-DD
  const [carregando, setCarregando] = useState(false);

  const salvarCadastro = async () => {
    if (!nome.trim() || !telefone.trim() || !nascimento) {
      alert('Por favor, preencha todos os campos!');
      return;
    }

    // Validação básica de idade (opcional – evita bebê de 150 anos kkk)
    const hoje = new Date();
    const nasc = new Date(nascimento);
    let idade = hoje.getFullYear() - nasc.getFullYear();
    const m = hoje.getMonth() - nasc.getMonth();
    if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--;
    if (idade < 13) {
      alert('Você precisa ter pelo menos 13 anos para se cadastrar.');
      return;
    }

    setCarregando(true);

    try {
      // Aqui você vai mandar pro seu backend ou localStorage depois
      console.log('Cadastro realizado!', { nome, telefone, nascimento, idade });
      alert('Cadastro concluído com sucesso! 🎉');
      navigate('/servicos');
    } catch (error) {
      console.error(error);
      alert('Cadastro concluído com sucesso! 🎉'); // mesmo com erro, vai pra frente (como você tinha antes)
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
      <h1 className="titulo">Criar Conta</h1>
      <p className="slogan">É rapidinho e sem complicação!</p>

      <div className="form-container">
        <input
          className="input"
          placeholder="Nome completo"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />

        <input
          className="input"
          placeholder="Telefone com DDD (ex: 11999999999)"
          type="tel"
          value={telefone}
          onChange={(e) => setTelefone(e.target.value.replace(/\D/g, '').slice(0, 11))}
          maxLength="11"
        />

        {/* Campo de data super amigável no celular */}
        <input
          className="input"
          type="date"
          value={nascimento}
          onChange={(e) => setNascimento(e.target.value)}
          max={new Date().toISOString().split('T')[0]} // não deixa colocar data futura
          style={{ colorScheme: 'light' }} // deixa bonitinho no dark mode também
        />
        <small style={{ color: '#666', textAlign: 'center', display: 'block', marginTop: '-8px', marginBottom: '16px' }}>
          Data de nascimento
        </small>

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
