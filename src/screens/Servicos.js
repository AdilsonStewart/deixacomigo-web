import React from "react";

const Servicos = () => {
  return (
    <div style={{ maxWidth: "400px", margin: "50px auto", textAlign: "center" }}>
      <img src="/coruja-rosa.gif" alt="coruja" style={{ width: "180px" }} />
      <h2>Escolha seu serviço</h2>
      
      <button>
        ÁUDIO — R$ 5,00
      </button>
      <br /><br />
      <button>
        VÍDEO — R$ 8,00
      </button>
      
      <p style={{ marginTop: "20px" }}>Página carregada - teste</p>
    </div>
  );
};

export default Servicos;
