import React, { useState } from "react";
import { getFirestore, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { v4 as uuidv4 } from "uuid";
import { useNavigate } from "react-router-dom";
import "./Cadastro.css";

// Config Firebase
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
  const [nascimento, setNascimento] = useState("");
  const [loading, setLoading] = useState(false);

  const salvarCadastro = async () => {
    const nomeLimpo = nome.trim();
    const telLimpo = telefone.trim();
    const nascLimpa = nascimento.trim();

    if (!nomeLimpo || !telLimpo || !nascLimpa) {
      alert("Preencha todos os campos.");
      return;
    }

    if (telLimpo.length !== 11) {
      alert("Telefone deve ter 11 dígitos (DDD + número).");
      return;
    }

    setLoading(true);

    try {
      const id = uuidv4();

      await setDoc(doc(db, "usuarios-cora", id), {
        id,
        nome: nomeLimpo,
        telefone: telLimpo,
        nascimento: nascLimpa,
        criadoEm: serverTimestamp(),
      });

      console.log("🔥 Cadastro salvo com sucesso:", {
        id,
        nome: nomeLimpo,
        telefone: telLimpo,
        nascimento: nascLimpa,
      });

      navigate(`/servicos?userId=${id}`);
    } catch (error) {
      console.error("Erro ao salvar no Firestore:", error);
      alert("Erro ao cadastrar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        minHeight: "100vh",
        padding: "20px",
      }}
    >
      {/* GIF no topo */}
      <img
        src="https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExaHFtYXcyN2xyYzFhMjF3NGw4NXpuaHppcnhuOGg3MTB2OHo3djY2cyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/WGBvn22mFXhRxFx0CQ/giphy.gif" // Troque pelo nome do seu GIF se for outro
        alt="Mascote animado"
        style={{ width: "180px", marginBottom: "20px" }}
      />

      <h1 style={{ fontSize: "2.5rem", marginBottom: "10px" }}>Criar Conta</h1>
      <p style={{ fontSize: "1.2rem", marginBottom: "30px" }}>
        É rapidinho e sem complicação!
      </p>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          maxWidth: "400px",
          gap: "20px",
        }}
      >
        <input
          style={{ padding: "15px", fontSize: "1.2rem" }}
          placeholder="Nome completo"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />

        <input
          style={{ padding: "15px", fontSize: "1.2rem" }}
          placeholder="Telefone com DDD"
          type="tel"
          value={telefone}
          onChange={(e) =>
            setTelefone(e.target.value.replace(/\D/g, "").slice(0, 11))
          }
          maxLength={11}
        />

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

        <button
          onClick={salvarCadastro}
          disabled={loading}
          style={{
            padding: "15px",
            fontSize: "1.5rem",
            background: "#ff69b4",
            color: "white",
            border: "none",
            borderRadius: "10px",
          }}
        >
          {loading ? "Cadastrando..." : "Criar Conta"}
        </button>
      </div>
    </div>
  );
}
