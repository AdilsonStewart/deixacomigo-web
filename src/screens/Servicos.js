const pagar = async (valor, tipo, metodo) => {
  setLoading(true);
  setCopiaECola("");
  setMetodoSelecionado(metodo);

  try {
    // ✅ DECIDE QUAL FUNCTION CHAMAR
    const functionName = metodo === 'pix' 
      ? "/.netlify/functions/criar-pix-asaas" 
      : "/.netlify/functions/criar-cartao-asaas"; // 👈 NOVA FUNCTION!

    const res = await fetch(functionName, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ valor, tipo, metodo })
    });

    const data = await res.json();
    
    if (data.success) {
      if (metodo === 'pix' && data.copiaECola) {
        setCopiaECola(data.copiaECola);
        navigator.clipboard.writeText(data.copiaECola);
        alert("PIX copiado! Cole no seu app bancário.");
      } else if (metodo === 'cartao' && data.checkoutUrl) {
        // ✅ CARTÃO: Abre o checkout
        window.open(data.checkoutUrl, '_blank');
        alert("Redirecionando para pagamento com cartão!");
      }
      
      if (data.id) {
        localStorage.setItem('ultimoPagamento', data.id);
        localStorage.setItem('tipoServico', tipo);
        localStorage.setItem('metodoPagamento', metodo);
      }
    } else {
      alert("Erro: " + data.erro);
    }
  } catch (e) {
    alert("Erro: " + e.message);
  } finally {
    setLoading(false);
  }
};
