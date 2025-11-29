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

  // Mascara para data DD/MM/AAAA
  const formatarData = (valor) => {
    valor = valor.replace(/\D/g, "");
    if (valor.length > 2) valor = valor.replace(/(\d{2})(\d)/, "$1/$2");
    if (valor.length > 5) valor = valor.replace(/(\d{2})\/(\d{2})(\d)/, "$1/$2/$3");
    return valor;
  };

  // Converter DD/MM/AAAA → YYYY-MM-DD antes de enviar ao backend
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
      const response = await fetch("/.netlify/functions/salvar-cadastro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome,
          telefone,
          dataNascimento: nascimentoISO,
          cpfCnpj,
          email
        }),
      });

      const data = await response.json();

      if (!data.success) throw new Error(data.error || "Erro desconhecido");

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
          />

          <input
            type="tel"
            placeholder="Telefone (somente números)"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
            className="cadastro-input"
          />

          {/* CAMPO DE NASCIMENTO SEM CALENDÁRIO (COM MÁSCARA) */}
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
            placeholder="CPF ou CNPJ"
            value={cpfCnpj}
            onChange={(e) => setCpfCnpj(e.target.value)}
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
            {loading ? "Salvando..." : "Cadastrar e Continuar"}
          </button>

          {erro && <p className="cadastro-erro">{erro}</p>}
        </div>
      </div>
    </div>
  );
}
