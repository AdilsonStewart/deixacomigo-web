import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import { db } from '../firebase/firebase-client';
import { doc, setDoc } from 'firebase/firestore';
import './Cadastro.css';

export default function Cadastro() {
  const navigate = useNavigate();

  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [nascimento, setNascimento] = useState('');
  const [carregando, setCarregando] = useState(false);

  const salvarCadastro = useCallback(async () => {
    setCarregando(true);
    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        alert('Você precisa estar logado.');
        setCarregando(false);
        return;
      }

      // ⭐ Salva no Firestore usando UID como ID do documento
      await setDoc(doc(db, 'usuarios-asaas', user.uid), {
        nome,
        telefone,
        nascimento,
        criadoEm: new Date().toISOString(),
        pago: false
      });

      console.log('✅ Cadastro salvo no Firestore!');

      navigate('/servicos');

    } catch (err) {
      console.error('❌ Erro ao cadastrar:', err);
      alert('Erro ao salvar cadastro.');
    } finally {
      setCarregando(false);
    }
  }, [nome, telefone, nascimento, navigate]);

  useEffect(() => {
    const nascimentoValido = /^(\d{2}\/\d{2}\/\d{4})$/.test(nascimento);
    const telefoneValido = telefone.replace(/\D/g, '').length >= 10;

    if (!carregando && nome.trim() && telefoneValido && nascimentoValido) {
      salvarCadastro();
    }
  }, [nome, telefone, nascimento, carregando, salvarCadastro]);

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
          placeholder="Telefone com DDD"
          type="tel"
          value={telefone}
          onChange={(e) =>
            setTelefone(e.target.value.replace(/\D/g, '').slice(0, 11))
          }
          maxLength="11"
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
          autoComplete="off"
        />

        {carregando && (
          <div style={{ textAlign: 'center', marginTop: '8px' }}>
            Cadastrando...
          </div>
        )}
      </div>
    </div>
  );
}
