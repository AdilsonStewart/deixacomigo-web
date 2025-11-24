import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './Cadastro.css';

export default function Cadastro() {
  const navigate = useNavigate();

  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [nascimento, setNascimento] = useState('');
  const [cpf, setCpf] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [cadastroConcluido, setCadastroConcluido] = useState(false);

  const salvarCadastro = useCallback(async () => {
    setCarregando(true);
    try {
      // AQUI depois entra o Firestore
      console.log('Cadastro realizado!', { nome, telefone, nascimento, cpf });

      await new Promise((r) => setTimeout(r, 500));

      setCadastroConcluido(true);
    } catch (err) {
      console.error('Erro ao cadastrar:', err);
    } finally {
      setCarregando(false);
    }
  }, [nome, telefone, nascimento, cpf]);

  useEffect(() => {
    const nascimentoValido = /^(\d{2}\/\d{2}\/\d{4})$/.test(nascimento);

    const telNum = telefone.replace(/\D/g, '');
    const telefoneValido = telNum.length >= 10;

    const cpfNum = cpf.replace(/\D/g, '');
    const cpfValido = cpfNum.length === 11;

    if (
      !carregando &&
      nome.trim() &&
      telefoneValido &&
      nascimentoValido &&
      cpfValido
    ) {
      salvarCadastro();
    }
  }, [nome, telefone, nascimento, cpf, carregando, salvarCadastro]);

  useEffect(() => {
    if (cadastroConcluido) {
      navigate('/servicos');
    }
  }, [cadastroConcluido, navigate]);

  return (
    <div className="container">
      <h1 className="titulo">Criar Conta</h1>
      <p className="slogan">É rapidinho e sem complicação!</p>

      <img
        src="https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExaHg3bWYzNGlzNHlwcXpxamptYXhoYnN5cnl6d2l1NjJ5d2s3bmtnMCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/7XHonPQqVy4Of0322v/giphy.gif"
        alt="Cadastro animado"
        className="cadastro-gif"
      />

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
          onChange={(e) =>
            setTelefone(e.target.value.replace(/\D/g, '').slice(0, 11))
          }
          maxLength="11"
        />

        <input
          className="input"
          placeholder="CPF (000.000.000-00)"
          value={cpf}
          onChange={(e) => {
            let v = e.target.value.replace(/\D/g, '');
            if (v.length > 11) v = v.slice(0, 11);

            if (v.length > 3) v = v.slice(0, 3) + '.' + v.slice(3);
            if (v.length > 7) v = v.slice(0, 7) + '.' + v.slice(7);
            if (v.length > 11) v = v.slice(0, 11) + '-' + v.slice(11);

            setCpf(v);
          }}
          maxLength="14"
          inputMode="numeric"
        />

        <input
          className="input"
          placeholder="Data de nascimento (dd/mm/aaaa)"
          value={nascimento}
          onChange={(e) => {
            let valor = e.target.value.replace(/\D/g, '');
            if (valor.length > 8) valor = valor.slice(0, 8);
            if (valor.length > 2) valor = valor.slice(0, 2) + '/' + valor.slice(2);
            if (valor.length > 5) valor = valor.slice(0, 5) + '/' + valor.slice(5);
            setNascimento(valor);
          }}
          maxLength="10"
          inputMode="numeric"
        />
      </div>
    </div>
  );
}
