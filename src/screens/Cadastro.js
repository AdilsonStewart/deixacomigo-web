import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../firebase/firebase-client'; // seu firebase-client.js

export default function Cadastro() {
  const navigate = useNavigate();
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [nascimento, setNascimento] = useState('');
  const [cpf, setCpf] = useState('');
  const [carregando, setCarregando] = useState(false);

  const salvarCadastro = useCallback(async () => {
    setCarregando(true);
    try {
      const userId = uuidv4(); // gera um ID único
      const novoUsuario = {
        nome,
        telefone,
        nascimento,
        cpf,
        criadoEm: new Date(),
      };

      // Salva no Firestore
      await setDoc(doc(db, 'usuarios-asaas', userId), novoUsuario);

      console.log('Cadastro realizado!', { ...novoUsuario, userId });

      // Redireciona para a página de serviços, enviando userId
      navigate('/servicos', { state: { userId } });
    } catch (err) {
      console.error('Erro ao cadastrar:', err);
      alert('Erro ao cadastrar. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  }, [nome, telefone, nascimento, cpf, navigate]);

  // Validações simples
  const podeCadastrar =
    nome.trim() &&
    telefone.replace(/\D/g, '').length >= 10 &&
    /^(\d{2}\/\d{2}\/\d{4})$/.test(nascimento) &&
    cpf.replace(/\D/g, '').length === 11;

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
          placeholder="Telefone com DDD"
          value={telefone}
          onChange={(e) =>
            setTelefone(e.target.value.replace(/\D/g, '').slice(0, 11))
          }
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
        />
        <input
          className="input"
          placeholder="CPF (somente números)"
          value={cpf}
          onChange={(e) =>
            setCpf(e.target.value.replace(/\D/g, '').slice(0, 11))
          }
          maxLength="11"
        />

        <button
          className="btn-new"
          onClick={salvarCadastro}
          disabled={!podeCadastrar || carregando}
        >
          {carregando ? 'Cadastrando...' : 'Continuar'}
        </button>
      </div>
    </div>
  );
}
