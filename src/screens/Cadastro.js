import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";

import "./Cadastro.css";

export default function Cadastro() {
  const navigate = useNavigate();
  const auth = getAuth();
  const db = getFirestore();

  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [nascimento, setNascimento] = useState("");
  const [cpf, setCpf] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCadastro = async () => {
    // validações básicas
    if (!nome || !telefone || !nascimento || !cpf) {
      alert("Preencha todos os campos corretamente.");
      return;
    }

    setLoading(true);

    try {
      // Criar email temporário baseado no telefone (ou outro campo único)
      const emailTemp = telefone + "@deixacomigo.com.br";

      // senha aleatória
      const senhaTemp = Math.random().toString(36).slice(-8);

      // Criar usuário no Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        emailTemp,
        senhaTemp
      );

      const user = userCredential.user;

      // Salvar dados adicionais no Firestore
      await setDoc(doc(db, "usuarios-asaas", user.uid), {
        nome,
        telefone,
        nascimento,
        cpf,
        uid: user.uid,
        criadoEm: new Date().toISOString(),
      });

      alert("Cadastro realizado com sucesso!");
      navigate("/servicos");
    } catch (err) {
      console.error("Erro completo ao cadastrar:", err);
      alert("Erro ao cadastrar. Tente novamente.");
    } finally {
      setLoading(false);
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
          placeholder="Telefone com DDD (ex: 11999999999)"
          type="tel"
          value={telefone}
          onChange={(e) =>
            setTelefone(e.target.value.replace(/\D/g, "").slice(0, 11))
          }
          maxLength="11"
        />

        <input
          className="input"
          placeholder="Data de nascimento (dd/mm/aaaa)"
          value={nascimento}
          onChange={(e) => {
            let valor = e.target.value.replace(/\D/g, "");
            if (valor.length > 8) valor = valor.slice(0, 8);
            if (valor.length > 2) valor = valor.slice(0, 2) + "/" + valor.slice(2);
            if (valor.length > 5) valor = valor.slice(0, 5) + "/" + valor.slice(5);
            setNascimento(valor);
          }}
          maxLength="10"
          inputMode="numeric"
        />

        <input
          className="input"
          placeholder="CPF (somente números)"
          value={cpf}
          onChange={(e) =>
            setCpf(e.target.value.replace(/\D/g, "").slice(0, 11))
          }
          maxLength="11"
        />

        <button
          className="botao"
          onClick={handleCadastro}
          disabled={loading}
        >
          {loading ? "Cadastrando..." : "Criar Conta"}
        </button>
      </div>
    </div>
  );
}
