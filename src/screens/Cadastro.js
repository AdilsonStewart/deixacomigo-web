import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Cadastro.css";

export default function Cadastro() {
  const navigate = useNavigate();
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCadastro = () => {
    if (!nome || !telefone) {
      alert("Preencha nome e telefone!");
      return;
    }

    setLoading(true);
    
    // Modo local (sem Firebase por enquanto)
    setTimeout(() => {
      localStorage.setItem("clienteId", "teste_" + Date.now());
      localStorage.setItem("clienteNome", nome);
      localStorage.setItem("clienteTelefone", telefone);
      navigate("/servicos");
      setLoading(false);
    }, 1000);
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
            placeholder="Telefone"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
            className="cadastro-input"
          />
          
          <button
            className="cadastro-botao"
            onClick={handleCadastro}
            disabled={loading}
          >
            {loading ? "Salvando…" : "Cadastrar"}
          </button>
        </div>
      </div>
    </div>
  );
}
