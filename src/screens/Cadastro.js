import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase/config";
import {
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  increment,
} from "firebase/firestore";
import "./Cadastro.css";

export default function Cadastro() {
  const navigate = useNavigate();
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  const handleCadastro = async () => {
    if (!nome || !telefone || !dataNascimento) {
      setErro("Preencha todos os campos!");
      return;
    }

    setLoading(true);
    setErro("");

    try {
      // 1. Pega o último número de pedido
      const pedidosRef = doc(db, "Config", "pedidos");
      const pedidosSnap = await getDoc(pedidosRef);
      let novoNumeroPedido = 1;
      if (pedidosSnap.exists()) {
        novoNumeroPedido = pedidosSnap.data().ultimoNumero + 1;
      }

      // 2. Atualiza o contador
      await updateDoc(pedidosRef, { ultimoNumero: increment(1) });

      // 3. Salva o cliente
      const clientesRef = collection(db, "clientes");
      await setDoc(doc(clientesRef, telefone), {
        nome,
        telefone,
        dataNascimento,
        numeroPedido: novoNumeroPedido,
        statusPagamento: "aguardando",
        tipo: null,
        criadoEm: new Date().toISOString(),
      });

      // 4. Vai para serviços
      navigate("/servicos");
    } catch (err) {
      console.error("Erro ao cadastrar:", err);
      setErro("Erro ao salvar dados. Tente novamente.");
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
