import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import './Cadastro.css';

export default function Cadastro() {
  const navigate = useNavigate();
  const db = getFirestore();

  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [cpf, setCpf] = useState('');
  const [nascimento, setNascimento] = useState('');
  const [carregando, setCarregando] = useState(false);

  const salvarCadastro = async () => {
    if (nome.trim().length < 3 || telefone.length < 10 || cpf.length < 11 || nascimento.length < 8) {
      alert('Por favor, preencha todos os campos corretamente.');
      return;
    }

    setCarregando(true);
    try {
      const userId = uuidv4(); // ID único interno

      await setDoc(doc(db, 'usuarios-asaas', userId), {
        nome: nome.trim(),
        telefone,
        cpf,
        nascimento,
        criadoEm: new Date().toISOString(),
      });

      navigate('/servicos', { state: { userId } });
    } catch (err) {
      console.error('Erro completo ao cadastrar:', err);
      alert('Erro ao cadastrar. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="container">
      <h1 style={{ fontSize: '2.5rem', marginBottom: '20px' }}>Criar Conta</h1>

      <input
        placeholder="Nome completo"
        maxLength={50}
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        style={{ fontSize: '1.5rem', padding: '12px', marginBottom: '15px', width: '100%' }}
      />

      <input
        placeholder="Telefone com DDD"
        maxLength={11}
        value={telefone}
        onChange={(e) => setTelefone(e.target.value.replace(/\D/g, '').slice(0, 11))}
        style={{ fontSize: '1.5rem', padding: '12px', marginBottom: '15px', width: '100%' }}
      />

      <input
        placeholder="CPF"
        maxLength={11}
        value={cpf}
        onChange={(e) => setCpf(e.target.value.replace(/\D/g, '').slice(0, 11))}
        style={{ fontSize: '1.5rem', padding: '12px', marginBottom: '15px', width: '100%' }}
      />

      <input
        placeholder="Data de nascimento (dd/mm/aaaa)"
        maxLength={10}
        value={nascimento}
        onChange={(e) => setNascimento(e.target.value)}
        style={{ fontSize: '1.5rem', padding: '12px', marginBottom: '20px', width: '100%' }}
      />

      <button
        onClick={salvarCadastro}
        disabled={carregando}
        style={{
          fontSize: '1.5rem',
          padding: '12px 30px',
          backgroundColor: '#ff69b4',
          color: 'white',
          border: 'none',
          borderRadius: '10px',
          cursor: 'pointer',
        }}
      >
        {carregando ? 'Salvando...' : 'Continuar'}
      </button>
    </div>
  );
}
