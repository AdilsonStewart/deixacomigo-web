import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Cadastro.css";

// Tenta importar o Firebase, mas não quebra o build se falhar
let firebaseInitialized = false;
let db = null;

try {
  // Importações dinâmicas para evitar erros de build
  const firebaseConfig = {
    apiKey: "AIzaSyC1Xv2mPNf4s2oY-Jeh2ev3x0O6qkKNqt4",
    authDomain: "deixacomigo-727ff.firebaseapp.com",
    projectId: "deixacomigo-727ff",
    storageBucket: "deixacomigo-727ff.firebasestorage.app",
    messagingSenderId: "304342645043",
    appId: "1:304342645043:web:893af23b41547a29a1a646"
  };

  const { initializeApp } = require("firebase/app");
  const { getFirestore, collection, addDoc } = require("firebase/firestore");
  
  const app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  firebaseInitialized = true;
  console.log("Firebase inicializado com sucesso!");
} catch (error) {
  console.warn("Firebase não inicializado. Modo de simulação ativado.", error);
}

export default function Cadastro() {
  const navigate = useNavigate();
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [cpfCnpj, setCpfCnpj] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  // Máscara DD/MM/AAAA
  const formatarData = (valor) => {
    valor = valor.replace(/\D/g, "");
    if (valor.length > 2) valor = valor.replace(/(\d{2})(\d)/, "$1/$2");
    if (valor.length > 5) valor = valor.replace(/(\d{2})\/(\d{2})(\d)/, "$1/$2/$3");
    return valor.slice(0, 10);
  };

  // Converter para formato ISO (YYYY-MM-DD)
  const converterParaISO = (str) => {
    const partes = str.split("/");
    if (partes.length !== 3) return "";
    return `${partes[2]}-${partes[1]}-${partes[0]}`;
  };

  const handleCadastro = async () => {
    if (!nome || !telefone || !dataNascimento || !cpfCnpj || !email) {
      setErro("Preencha todos os campos!");
      return;
    }

    const nascimentoISO = converterParaISO(dataNascimento);
    if (!nascimentoISO || nascimentoISO.length < 10) {
      setErro("Data de nascimento inválida");
      return;
    }

    setLoading(true);
    setErro("");

    try {
      if (firebaseInitialized && db) {
        // Salva no Firebase
        const { collection, addDoc } = require("firebase/firestore");
        const docRef = await addDoc(collection(db, "clientes"), {
          nome,
          telefone,
          dataNascimento: nascimentoISO,
          cpfCnpj,
          email,
          criadoEm: new Date().toISOString(),
          status: "ativo"
        });

        console.log("Cliente salvo no Firebase com ID:", docRef.id);
        localStorage.setItem("clienteId", docRef.id);
      } else {
        // Modo simulação
        console.log("Modo simulação: salvando localmente");
        localStorage.setItem("clienteId", "simulado_" + Date.now());
      }

      localStorage.setItem("clienteNome", nome);
      localStorage.setItem("clienteTelefone", telefone);

      navigate("/servicos");
    } catch (err) {
      console.error("Erro ao cadastrar:", err);
      setErro("Erro ao salvar. Tente novamente. " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cadastro-page">
      <div className="cadastro-card">
        <h1 className="cadastro-titulo">Cadastro</h1>
        <div className="cadastro-form">
          <input
            type="text"
            placeholder="Nome completo"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="cadastro-input"
            autoComplete="off"
          />
          <input
            type="tel"
            placeholder="Telefone (somente números)"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value.replace(/\D/g, ""))}
            className="cadastro-input"
            autoComplete="off"
          />
          <input
            type="text"
            placeholder="Nascimento (DD/MM/AAAA)"
            maxLength="10"
            value={dataNascimento}
            onChange={(e) => setDataNascimento(formatarData(e.target.value))}
            className="cadastro-input"
            autoComplete="off"
          />
          <input
            type="text"
            placeholder="CPF ou CNPJ (somente números)"
            value={cpfCnpj}
            onChange={(e) => setCpfCnpj(e.target.value.replace(/\D/g, ""))}
            className="cadastro-input"
            autoComplete="off"
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="cadastro-input"
            autoComplete="off"
          />

          <button
            className="cadastro-botao"
            onClick={handleCadastro}
            disabled={loading}
          >
            {loading ? "Salvando…" : "Cadastrar e Continuar"}
          </button>

          {erro && <p className="cadastro-erro">{erro}</p>}
        </div>
      </div>
    </div>
  );
}
