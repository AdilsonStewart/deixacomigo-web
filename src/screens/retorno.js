import { useEffect } from "react";

const Retorno = () => {
  useEffect(() => {
    // Lê o tipo salvo antes do pagamento
    const tipo = localStorage.getItem("tipoCompra");

    if (tipo === "audio") {
      window.location.href = "/audiorecord";
    } else if (tipo === "video") {
      window.location.href = "/videorecord";
    } else {
      // Caso algo dê errado, manda para a home
      window.location.href = "/";
    }
  }, []);

  return (
    <div style={{ textAlign: "center", marginTop: "80px" }}>
      <h2>Pagamento confirmado!</h2>
      <p>Estamos preparando sua página. Aguarde alguns instantes...</p>
    </div>
  );
};

export default Retorno;
