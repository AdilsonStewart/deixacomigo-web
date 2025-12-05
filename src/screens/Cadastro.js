import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import firebaseConfig from "./firebaseConfig";
import "./Cadastro.css";

// Inicializar Firebase fora do componente para evitar múltiplas inicializações
let firebaseApp, db;

// Função para inicializar Firebase uma única vez
const initFirebase = () => {
  if (!firebaseApp) {
    try {
      firebaseApp = initializeApp(firebaseConfig);
      db = getFirestore(firebaseApp);
      console.log("Firebase inicializado");
    } catch (error) {
      console.error("Erro ao inicializar Firebase:", error);
    }
  }
  return { firebaseApp, db };
};

export default function Cadastro() {
  const navigate = useNavigate();
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [cpfCnpj, setCpfCnpj] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  // Inicializar Firebase quando o componente carregar
  useEffect(() => {
    initFirebase();
  }, []);

  const formatarData = (valor) => {
    valor = valor.replace(/\D/g, "");
    if (valor.length > 2) valor = valor.replace(/(\d{2})(\d)/, "$1/$2");
    if (valor.length > 5) valor = valor.replace(/(\d{2})\/(\d{2})(\d)/, "$1/$2/$3");
    return valor.slice(0, 10);
  };

  const converterParaISO = (str) => {
    const partes = str.split("/");
    if (partes.length !== 3) return "";
    return `${partes[2]}-${partes[1]}-${partes[0]}`;
  };

  const handleCadastro = async () => {
    if (!nome || !telefone) {
      setErro("Preencha nome e telefone!");
      return;
    }

    setLoading(true);
    setErro("");

    try {
      // Se Firebase não inicializou, usa modo de teste
      if (!db) {
        throw new Error("Firebase não disponível - modo teste");
      }

      const nascimentoISO = dataNascimento ? converterParaISO(dataNascimento) : "";
      
      const docRef = await addDoc(collection(db, "clientes"), {
        nome,
        telefone,
        ...(dataNascimento && { dataNascimento: nascimentoISO }),
        ...(cpfCnpj && { cpfCnpj }),
        ...(email && { email }),
        criadoEm: new Date().toISOString(),
        status: "ativo"
      });

      localStorage.setItem("clienteId", docRef.id);
      localStorage.setItem("clienteNome", nome);
      localStorage.setItem("clienteTelefone", telefone);

      navigate("/servicos");
    } catch (err) {
      console.error("Erro ao cadastrar:", err);
      
      // Modo de fallback: salva no localStorage se Firebase falhar
      localStorage.setItem("clienteId", "local_" + Date.now());
      localStorage.setItem("clienteNome", nome);
      localStorage.setItem("clienteTelefone", telefone);
      
      alert("Cadastrado localmente (Firebase offline). Continuando...");
      navigate("/servicos");
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
            placeholder="Nome completo *"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="cadastro-input"
            required
          />
          <input
            type="tel"
            placeholder="Telefone * (somente números)"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value.replace(/\D/g, ""))}
            className="cadastro-input"
            required
          />
          <input
            type="text"
            placeholder="Nascimento (DD/MM/AAAA)"
            maxLength="10"
            value={dataNascimento}
            onChange={(e) => setDataNascimento(formatarData(e.target.value))}
            className="cadastro-input"
          />
          <input
            type="text"
            placeholder="CPF ou CNPJ (somente números)"
            value={cpfCnpj}
            onChange={(e) => setCpfCnpj(e.target.value.replace(/\D/g, ""))}
            className="cadastro-input"
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="cadastro-input"
          />

          <button
            className="cadastro-botao"
            onClick={handleCadastro}
            disabled={loading}
          >
            {loading ? "Salvando…" : "Cadastrar e Continuar"}
          </button>

          {erro && <p className="cadastro-erro">{erro}</p>}
          
          <p style={{color: '#666', fontSize: '12px', marginTop: '20px'}}>
            * Campos obrigatórios
          </p>
        </div>
      </div>
    </div>
  );
}
