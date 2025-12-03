import { useEffect } from "react";

export default function Retorno() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tipo = params.get("tipo");

    if (tipo === "audio") {
      window.location.href = "/audiorecord";
    } else if (tipo === "video") {
      window.location.href = "/videorecord";
    } else {
      // Se não vier nada, manda pra home ou serviço
      window.location.href = "/servicos";
    }
  }, []);

  return (
    <div
      style={{
        textAlign: "center",
        marginTop: "50px",
        fontSize: "22px",
        color: "#444",
      }}
    >
      Redirecionando...
    </div>
  );
}
