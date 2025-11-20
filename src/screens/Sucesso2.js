import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Sucesso2.css";

function Sucesso2() {
  const navigate = useNavigate();

  // ⏳ Após 3 segundos, vai para o gravador de vídeo
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/videorecorder");
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="sucesso2-container">
      <div className="sucesso2-card">
        <h1 className="sucesso2-title">Pagamento Confirmado! 🎉</h1>
        <p className="sucesso2-text">
          Tudo certo! Vamos te levar para gravar o seu <strong>vídeo</strong>.
        </p>

        <div className="sucesso2-loader"></div>

        <p className="sucesso2-subtext">Redirecionando...</p>
      </div>
    </div>
  );
}

export default Sucesso2;
