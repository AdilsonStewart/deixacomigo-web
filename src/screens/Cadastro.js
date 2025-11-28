import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase/config";
import { collection, doc, setDoc, getDoc, updateDoc, increment } from "firebase/firestore";
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
      // 1️⃣ Pegar o último número de pedido
      const pedidosRef = doc(db, "Config", "pedidos");
      const pedidosSnap = await getDoc(pedidosRef);

      let novoNumeroPedido = 1; // padrão
      if (pedidosSnap.exists()) {
        novoNumeroPedido = pedidosSnap.data().ultimoNumero + 1;
      }

      // 2️⃣ Atualizar o último número no Firestore
      await updateDoc(pedidosRef, { ultimoNumero: increment(1) });

      // 3️⃣ Salvar cliente com número do pedido
      const clientesRef = collection(db, "clientes");
      await setDoc(doc(clientesRef, telefone), {
        nome,
        telefone,
        dataNascimento,
        numeroPedido: novoNumeroPedido,
        statusPagamento: "aguardando",
        tipo: null, // será definido depois de escolher audio ou video
        criadoEm: new Date().toISOString()
      });

      // 4️⃣ Redirecionar para a página de serviços
      navigate("/servicos");
    } catch (err) {
      console.error("Erro ao cadastrar:", err);
      setErro("Erro ao salvar dados. Tente novamente.");
    }

    setLoading(false);
  };

  return (
    <div className="cadastro-container">
      <h1 className="titulo">Cadastro</h1>

      <div className="form-box">
        <input
          type="text"
          placeholder="Nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />

        <input
          type="tel"
          placeholder="Telefone (somente números)"
          value={telefone}
          onChange={(e) => setTelefone(e.target.value)}
        />

        <input
          type="date"
          placeholder="Data de Nascimento"
          value={dataNascimento}
          onChange={(e) => setDataNascimento(e.target.value)}
        />

        <button className="botao" onClick={handleCadastro} disabled={loading}>
          {loading ? "Salvando..." : "Cadastrar"}
        </button>

        {erro && <p className="erro">{erro}</p>}
      </div>
    </div>
  );
}
