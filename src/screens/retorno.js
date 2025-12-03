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
      window.location.href = "/";
    }
  }, []);

  return (
    <div style={{ textAlign: "center", marginTop: "80px" }}>
      <h2>Processando retorno do pagamento...</h2>
      <p>Aguarde, estamos redirecionando você.</p>
    </div>
  );
};

export default Retorno;
