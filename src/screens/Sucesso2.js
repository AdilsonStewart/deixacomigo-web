// Sucesso2.js
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Sucesso2() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/video-recorder"); // rota da sua VideoRecorderPage.js
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div style={{ textAlign: "center", padding: "40px" }}>
      <h1>Pagamento Aprovado! 🎉</h1>
      <p>Redirecionando para a gravação do vídeo em instantes...</p>
    </div>
  );
}
