import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Cadastro.css";

export default function Cadastro() {
  const navigate = useNavigate();
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [cpfCnpj, setCpfCnpj] = useState(""); // NOVO CAMPO
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  const handleCadastro = async () => {
    if (!nome || !telefone || !dataNascimento || !cpfCnpj) {
      setErro("Preencha todos os campos!");
      return;
    }

    setLoading(true);
    setErro("");

    try {
      // Chama a function do Netlify (server-side) pra salvar o cliente
      const response = await fetch("/.netlify/functions/salvar-cliente", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome,
          telefone,
          dataNascimento,
          cpfCnpj, // envia CPF/CNPJ
        }),
      });

      const data = await response.json();

      if (!data.success) throw new Error(data.error || "Erro desconhecido");

      // Redireciona pra serviços
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
          <input
            type="date"
            value={dataNascimento}
            onChange={(e) => setDataNascimento(e.target.value)}
            className="cadastro-input"
          />
          <input
            type="text"
            placeholder="CPF ou CNPJ"
            value={cpfCnpj}
            onChange={(e) => setCpfCnpj(e.target.value)}
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
