const criarPagamento = async (valor, tipo) => {
  try {
    const response = await fetch("/.netlify/functions/criar-pagamento", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ valor, tipo })
    });

    const data = await response.json();

    if (data.success && data.init_point) {
      window.location.href = data.init_point;
    } else {
      alert("Erro ao criar o pagamento. Tente novamente.");
      console.error(data);
    }
  } catch (error) {
    alert("Houve um erro na comunicação com o servidor. Verifique sua conexão.");
  }
};
