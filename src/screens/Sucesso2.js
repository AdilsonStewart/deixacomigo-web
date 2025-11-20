import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Sucesso2.css";

function Sucesso2() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/videorecorder");
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="sucesso2-container">
      <div className="sucesso2-card">
        <h2 className="sucesso2-title">Pagamento Aprovado! 🎉</h2>
        <p className="sucesso2-text">Aguarde um instante…</p>
        <div className="sucesso2-loader"></div>
        <p className="sucesso2-subtext">
          Você será redirecionado para a gravação do vídeo.
        </p>
      </div>
    </div>
  );
}

export default Sucesso2;
