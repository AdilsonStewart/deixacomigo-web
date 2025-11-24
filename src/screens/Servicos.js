import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

const Servicos = () => {
  const [userId, setUserId] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const id = params.get("userId");
    if (!id) {
      alert("Usuário não identificado. Volte ao cadastro.");
    } else {
      setUserId(id);
    }
  }, [location]);

  const pagar = async (valor, tipo) => {
    if (!userId) {
      alert("Usuário não identificado. Volte ao cadastro.");
      return;
    }

    // restante do código do PIX, enviando userId no body
    const res = await fetch("/.netlify/functions/criar-pix-asaas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ valor, tipo, userId }),
    });

    const data = await res.json();
    if (data.success) {
      console.log("PIX gerado!", data);
    } else {
      alert("Erro: " + JSON.stringify(data));
    }
  };

  return (
    <div>
      <h2>Serviços</h2>
      <button onClick={() => pagar(5.0, "áudio")}>Áudio R$5</button>
      <button onClick={() => pagar(8.0, "vídeo")}>Vídeo R$8</button>
    </div>
  );
};

export default Servicos;
