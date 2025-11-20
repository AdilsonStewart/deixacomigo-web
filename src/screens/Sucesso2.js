import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Sucesso.css"; // usa o mesmo CSS da tela Sucesso

const Sucesso2 = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/videorecorder"); // ← Destino diferente!
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="sucesso-container">
      <h1 className="sucesso-title">Pagamento Confirmado! 🎉</h1>
      <p className="sucesso-message">Preparando sua gravação de vídeo...</p>
    </div>
  );
};

export default Sucesso2;
