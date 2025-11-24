import React, { useState } from "react";
import { getFirestore, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { v4 as uuidv4 } from "uuid";
import { useNavigate } from "react-router-dom";
import "./Cadastro.css";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default function Cadastro() {
  const navigate = useNavigate();
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cpf, setCpf] = useState("");
  const [nascimento, setNascimento] = useState("");
  const [loading, setLoading] = useState(false);

  const salvarCadastro = async () => {
    if (!nome || !telefone || !cpf || !nascimento) {
      alert("Preencha todos os campos.");
      return;
    }

    setLoading(true);
    try {
      const id = uuidv4();
      await setDoc(doc(db, "usuarios-asaas", id), {
        nome,
        telefone,
        cpf,
        nascimento,
        criadoEm: serverTimestamp(),
      });

      console.log("Cadastro realizado!", { nome, telefone, cpf, nascimento, userId: id });

      // Redireciona para serviços, passando o userId como query param
      navigate(`/servicos?userId=${id}`);
    } catch (error) {
      console.error("Erro completo ao cadastrar:", error);
      alert("Erro ao cadastrar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", minHeight: "100vh", padding: "20px" }}>
      <h1 style={{ fontSize: "2.5rem", marginBottom: "10px" }}>Criar Conta</h1>
      <p style={{ fontSize: "1.2rem", marginBottom: "30px" }}>É rapidinho e sem complicação!</p>

      <div style={{ display: "flex", flexDirection: "column", width: "100%", maxWidth: "400px", gap: "20px" }}>
        <input style={{ padding: "15px", fontSize: "1.2rem" }} placeholder="Nome completo" value={nome} onChange={(e) => setNome(e.target.value)} />
        <input style={{ padding: "15px", fontSize: "1.2rem" }} placeholder="Telefone com DDD" type="tel" value={telefone} onChange={(e) => setTelefone(e.target.value.replace(/\D/g, "").slice(0, 11))} maxLength={11} />
        <input style={{ padding: "15px", fontSize: "1.2rem" }} placeholder="CPF" value={cpf} onChange={(e) => setCpf(e.target.value.replace(/\D/g, "").slice(0, 11))} maxLength={11} />
        <input
          style={{ padding: "15px", fontSize: "1.2rem" }}
          placeholder="Data de nascimento (dd/mm/aaaa)"
          value={nascimento}
          onChange={(e) => {
            let val = e.target.value.replace(/\D/g, "");
            if (val.length > 8) val = val.slice(0, 8);
            if (val.length > 2) val = val.slice(0, 2) + "/" + val.slice(2);
            if (val.length > 5) val = val.slice(0, 5) + "/" + val.slice(5);
            setNascimento(val);
          }}
          maxLength={10}
        />
        <button onClick={salvarCadastro} disabled={loading} style={{ padding: "15px", fontSize: "1.5rem", background: "#ff69b4", color: "white", border: "none", borderRadius: "10px" }}>
          {loading ? "Cadastrando..." : "Criar Conta"}
        </button>
      </div>
    </div>
  );
}
