import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase/config"; 
import "./SouCliente.css";

export default function SouCliente() {
  const navigate = useNavigate();

  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cliente, setCliente] = useState(null);
  const [loading, setLoading] = useState(false);

  // GIFS
  const aguardandoGif =
    "https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExbnRxdXh3YmY3c3d3YzdzZDhkM2N4dG9xeXgyNXBpYzltbjJnZGc4ZSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/wH69SAXGiPDI2xQ0OX/giphy.gif";

  const corujaGif =
    "https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExeXM5bDNhZHc4ODZleTJiNDY2cmdzM2l0YmthZGFrNG44c2ZqcWk0NGE6ZXA9djFfaW50ZXJuYWxfZ2lmX2J5X2lkJmN0PXM/RLILllLdYpAfxxwLbO/giphy.gif";

  // Buscar cliente no Firestore
  async function buscarCliente() {
    setLoading(true);
    setCliente(null);

    try {
      const ref = collection(db, "clientes");
      const q = query(ref, where("telefone", "==", telefone));
      const result = await getDocs(q);

      if (!result.empty) {
        const dados = result.docs[0].data();
        setCliente(dados);
      } else {
        setCliente("nao-encontrado");
      }
    } catch (err) {
      console.error("Erro ao buscar cliente:", err);
    }

    setLoading(false);
  }

  // Monitorar status do pagamento
  useEffect(() => {
    if (!cliente || cliente === "nao-encontrado") return;

    if (cliente.statusPagamento === "aprovado") {
      if (cliente.tipo === "audio") {
        navigate("/audiorecord");
      } else if (cliente.tipo === "video") {
        navigate("/videorecord");
      }
      return;
    }

    // Se for "aguardando", checa novamente a cada 3 segundos
    const interval = setInterval(async () => {
      const ref = collection(db, "clientes");
      const q = query(ref, where("telefone", "==", telefone));
      const result = await getDocs(q);

      if (!result.empty) {
        const dados = result.docs[0].data();
        setCliente(dados);

        if (dados.statusPagamento === "aprovado") {
          clearInterval(interval);
          if (dados.tipo === "audio") navigate("/audiorecord");
          if (dados.tipo === "video") navigate("/videorecord");
        }
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [cliente, telefone, navigate]);

  return (
    <div className="soucliente-container">
      <h1 className="titulo">Sou Cliente</h1>

      {/* Formulário */}
      {!cliente && !loading && (
        <>
          <p className="descricao">
            Digite seu nome e telefone para localizar seu pedido.
          </p>

          <div className="form-box">
            <input
              type="text"
              placeholder="Seu nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />

            <input
              type="tel"
              placeholder="Telefone (somente números)"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
            />

            <button className="botao" onClick={buscarCliente}>
              Buscar
            </button>
          </div>

          <div className="gif-area">
            <img src={corujaGif} alt="Coruja" className="gif" />
          </div>
        </>
      )}

      {/* Carregando */}
      {loading && <p className="loading">⏳ Buscando informações...</p>}

      {/* Cliente não encontrado */}
      {cliente === "nao-encontrado" && (
        <div className="erro-box">
          <p>❌ Não encontramos cadastro com esse telefone.</p>
          <p>Se quiser, volte e refaça seu pedido.</p>

          <button
            className="botao-voltar"
            onClick={() => navigate("/")}
          >
            🔙 Voltar ao início
          </button>
        </div>
      )}

      {/* Aguardando pagamento */}
      {cliente && cliente.statusPagamento === "aguardando" && (
        <div className="aguardando-box">
          <img src={aguardandoGif} className="gif" alt="Aguardando" />

          <h2>Pagamento em processamento...</h2>
          <p>Pode aguardar aqui.</p>
          <p>Atualizamos automaticamente a cada 3 segundos.</p>
          <p className="menor">
            Assim que for aprovado, você será levado à gravação.
          </p>
        </div>
      )}
    </div>
  );
}
