import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Cadastro.css";

export default function Cadastro() {
  const navigate = useNavigate();
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [dataNascimento, setDataNascimento] = useState(""); // Campo nascimento
  const [cpfCnpj, setCpfCnpj] = useState("");
  const [email, setEmail] = useState(""); // Email do usuário
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  // 👉 Função para aplicar máscara: DD/MM/AAAA
  const aplicarMascaraData = (valor) => {
    let v = valor.replace(/\D/g, ""); // só números

    if (v.length > 4) v = v.replace(/(\d{2})(\d{2})(\d+)/, "$1/$2/$3");
    else if (v.length > 2) v = v.replace(/(\d{2})(\d+)/, "$1/$2");

    return v;
  };

  const handleCadastro = async () => {
    if (!nome || !telefone || !dataNascimento || !cpfCnpj || !email) {
      setErro("Preencha todos os campos!");
      return;
    }

    setLoading(true);
    setErro("");

    try {
      const response = await fetch("/.netlify/functions/criar-pagamento-asaas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome,
          telefone,
          dataNascimento, // envia nascimento — mantém igual
          cpfCnpj,
          email,
          valor: 5,
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

          {/* 👉 Campo com máscara */}
          <input
            type="text"
            placeholder="Nascimento (DD/MM/AAAA)"
            value={dataNascimento}
            maxLength={10}
            onChange={(e) => setDataNascimento(aplicarMascaraData(e.target.value))}
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
