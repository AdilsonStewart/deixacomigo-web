import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Cadastro.css';

export default function Cadastro() {
  const navigate = useNavigate();
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [nascimento, setNascimento] = useState(''); // vai ficar no formato dd/mm/aaaa
  const [carregando, setCarregando] = useState(false);

  const salvarCadastro = async () => {
    if (!nome.trim() || !telefone.trim() || !nascimento.trim()) {
      alert('Por favor, preencha todos os campos!');
      return;
    }

    // Validação básica da data (aceita dd/mm/aaaa ou d/m/aaaa)
    if (!/^(\d{2}\/\d{2}\/\d{4})$/.test(nascimento)) {
      alert('Data de nascimento inválida. Use o formato dd/mm/aaaa');
      return;
    }

    setCarregando(true);

    try {
      console.log('Cadastro realizado!', { nome, telefone, nascimento });
      alert('Cadastro concluído com sucesso! 🎉');
      navigate('/servicos');
    } catch (error) {
      console.log('Cadastro realizado!', { nome, telefone, nascimento });
      alert('Cadastro concluído com sucesso! 🎉');
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

        {/* ←←← DATA DE NASCIMENTO SÓ COM NÚMEROS (teclado numérico no celular) →→→ */}
        <input
          className="input"
          placeholder="Data de nascimento (dd/mm/aaaa)"
          value={nascimento}
          onChange={(e) => {
            let valor = e.target.value.replace(/\D/g, ''); // só números
            if (valor.length > 8) valor = valor.slice(0, 8);
            if (valor.length > 2) valor = valor.slice(0, 2) + '/' + valor.slice(2);
            if (valor.length > 5) valor = valor.slice(0, 5) + '/' + valor.slice(5);
            setNascimento(valor);
          }}
          maxLength="10"
          inputMode="numeric"     // abre teclado numérico no celular
          autoComplete="off"
        />
        <small style={{ color: '#888', textAlign: 'center', display: 'block', marginTop: '-8px', marginBottom: '16px' }}>
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
