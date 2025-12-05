import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Cadastro.css";

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
      // Tenta usar Firebase se disponível
      let clienteId = "local_" + Date.now();
      
      if (typeof window.firebase !== 'undefined') {
        // Firebase está disponível, tenta salvar
        const firebase = window.firebase;
        const db = firebase.firestore();
        const docRef = await db.collection("clientes").add({
          nome,
          telefone,
          dataNascimento: nascimentoISO,
          cpfCnpj,
          email,
          criadoEm: new Date().toISOString(),
          status: "ativo"
        });
        clienteId = docRef.id;
      } else {
        console.warn("Firebase não disponível. Usando modo local.");
      }

      // Guarda no localStorage
      localStorage.setItem("clienteId", clienteId);
      localStorage.setItem("clienteNome", nome);
      localStorage.setItem("clienteTelefone", telefone);

      navigate("/servicos");
    } catch (err) {
      console.error("Erro ao cadastrar:", err);
      setErro("Erro ao salvar. Tente novamente.");
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
