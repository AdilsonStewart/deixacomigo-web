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
    if (!nome || !telefone || !cpf || !nascimento) {
      alert('Preencha todos os campos.');
      return;
    }

    setCarregando(true);
    try {
      // Cria um ID interno
      const userId = uuidv4();

      // Salva no Firestore
      await setDoc(doc(db, 'usuarios-asaas', userId), {
        nome,
        telefone,
        cpf,
        nascimento,
        criadoEm: new Date().toISOString(),
      });

      // Redireciona direto para a tela de serviços
      navigate('/servicos', { state: { userId } });
    } catch (err) {
      console.error('Erro ao cadastrar:', err);
      alert('Erro ao cadastrar. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="container">
      <h1>Criar Conta</h1>
      <input
        placeholder="Nome completo"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
      />
      <input
        placeholder="Telefone com DDD"
        value={telefone}
        onChange={(e) => setTelefone(e.target.value.replace(/\D/g, '').slice(0, 11))}
      />
      <input
        placeholder="CPF"
        value={cpf}
        onChange={(e) => setCpf(e.target.value.replace(/\D/g, '').slice(0, 11))}
      />
      <input
        placeholder="Data de nascimento (dd/mm/aaaa)"
        value={nascimento}
        onChange={(e) => setNascimento(e.target.value)}
      />
      <button onClick={salvarCadastro} disabled={carregando}>
        {carregando ? 'Salvando...' : 'Continuar'}
      </button>
    </div>
  );
}
