import { useEffect } from "react";

const Retorno = () => {
  useEffect(() => {
    // Pega parâmetros da URL (ex.: ?custom=audio)
    const params = new URLSearchParams(window.location.search);
    const tipo = params.get("custom");

    // Redireciona conforme o tipo do serviço
    if (tipo === "audio") {
      window.location.href = "/audiorecord";
    } else if (tipo === "video") {
      window.location.href = "/videorecord";
    } else {
      // Caso não venha nada, manda para home
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
