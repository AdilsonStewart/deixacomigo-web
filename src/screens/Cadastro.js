import React, { useState } from "react";
import "./Cadastro.css";
import { db } from "../firebase/config";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function Cadastro() {
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [nascimento, setNascimento] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!telefone) {
      alert("Informe seu telefone");
      return;
    }

    try {
      const ref = doc(db, "clientes", telefone);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        // Atualiza dados
        await setDoc(ref, {
          nome: nome || snap.data().nome,
          telefone,
          nascimento: nascimento || snap.data().nascimento,
          statusPagamento: snap.data().statusPagamento || "pendente",
          criadoEm: snap.data().criadoEm || new Date(),
        });

      } else {
        // Cria novo cliente
        await setDoc(ref, {
          nome,
          telefone,
          nascimento,
          statusPagamento: "pendente",
          criadoEm: new Date(),
        });
      }

      // Redireciona para os serviços
      navigate("/servicos");

    } catch (error) {
      console.error("Erro ao salvar cliente:", error);
      alert("Erro ao salvar cadastro. Tente novamente.");
    }
  };

  return (
    <div className="cadastro-container">
      <h1>Faça seu Cadastro</h1>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Seu nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
        />

        <input
          type="text"
          placeholder="Telefone (somente números)"
          value={telefone}
          onChange={(e) => setTelefone(e.target.value)}
          required
        />

        <input
          type="date"
          value={nascimento}
          onChange={(e) => setNascimento(e.target.value)}
          required
        />

        <button type="submit">Continuar</button>
      </form>
    </div>
  );
}
