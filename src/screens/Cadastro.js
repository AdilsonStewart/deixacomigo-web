import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import app from "../firebase/firebase-client";
import "./Cadastro.css";

const db = getFirestore(app);

export default function Cadastro() {
  const navigate = useNavigate();

  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [nascimento, setNascimento] = useState("");
  const [cpf, setCpf] = useState("");
  const [carregando, setCarregando] = useState(false);

  const salvarCadastro = useCallback(async () => {
    setCarregando(true);
    try {
      // validação simples
      const nascimentoValido = /^(\d{2}\/\d{2}\/\d{4})$/.test(nascimento);
      const telefoneSomenteNumeros = telefone.replace(/\D/g, "");
      const telefoneValido = telefoneSomenteNumeros.length >= 10;
      const cpfSomenteNumeros = cpf.replace(/\D/g, "");
      const cpfValido = cpfSomenteNumeros.length === 11;

      if (!nome.trim() || !telefoneValido || !nascimentoValido || !cpfValido) {
        alert("Preencha todos os campos corretamente.");
        return;
      }

      // gerar userId
      const userId = uuidv4();

      // salvar no Firestore
      await setDoc(doc(db, "usuarios-asaas", userId), {
        nome,
        telefone,
        nascimento,
        cpf,
        criadoEm: new Date(),
      });

      console.log("Cadastro realizado!", { nome, telefone, nascimento, cpf, userId });

      // redireciona para serviços passando userId
      navigate("/servicos", { state: { userId } });
    } catch (err) {
      console.error("Erro ao cadastrar:", err);
      alert("Erro ao cadastrar. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  }, [nome, telefone, nascimento, cpf, navigate]);

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
          maxLength={11}
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
          maxLength={10}
          inputMode="numeric"
        />

        <input
          className="input"
          placeholder="CPF (somente números)"
          value={cpf}
          onChange={(e) =>
            setCpf(e.target.value.replace(/\D/g, "").slice(0, 11))
          }
          maxLength={11}
        />

        <button className="btn-new" onClick={salvarCadastro} disabled={carregando}>
          {carregando ? "Cadastrando..." : "Cadastrar"}
        </button>
      </div>
    </div>
  );
}
