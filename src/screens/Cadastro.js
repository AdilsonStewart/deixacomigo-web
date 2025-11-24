import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import './Cadastro.css';

export default function Cadastro() {
  const navigate = useNavigate();
  const auth = getAuth();
  const db = getFirestore();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [cpf, setCpf] = useState('');
  const [telefone, setTelefone] = useState('');
  const [nascimento, setNascimento] = useState('');
  const [carregando, setCarregando] = useState(false);

  const salvarCadastro = async () => {
    setCarregando(true);
    try {
      // Criar usuário no Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
      const user = userCredential.user;

      // Salvar dados adicionais no Firestore
      await setDoc(doc(db, 'usuarios-asaas', user.uid), {
        nome,
        cpf,
        telefone,
        nascimento,
        email,
        uid: user.uid,
      });

      console.log('Cadastro realizado!', user);
      navigate('/servicos'); // Redireciona para os serviços
    } catch (error) {
      console.error('Erro completo ao cadastrar:', error);

      if (error.code === 'auth/email-already-in-use') {
        alert('Este e-mail já está cadastrado. Tente fazer login.');
      } else if (error.code === 'auth/invalid-email') {
        alert('E-mail inválido.');
      } else if (error.code === 'auth/weak-password') {
        alert('Senha muito fraca. Use no mínimo 6 caracteres.');
      } else {
        alert('Erro ao cadastrar. Tente novamente.');
      }
    } finally {
      setCarregando(false);
    }
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
          placeholder="E-mail"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="input"
          placeholder="Senha (mínimo 6 caracteres)"
          type="password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
        />

        <input
          className="input"
          placeholder="CPF"
          value={cpf}
          onChange={(e) => setCpf(e.target.value.replace(/\D/g, '').slice(0, 11))}
          maxLength="11"
        />

        <input
          className="input"
          placeholder="Telefone com DDD"
          value={telefone}
          onChange={(e) => setTelefone(e.target.value.replace(/\D/g, '').slice(0, 11))}
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
        />

        <button
          className="btn-cadastro"
          onClick={salvarCadastro}
          disabled={carregando}
        >
          {carregando ? 'Cadastrando...' : 'Cadastrar'}
        </button>
      </div>
    </div>
  );
}
