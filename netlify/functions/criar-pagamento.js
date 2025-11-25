// ✅ CONFIGURAÇÃO CORRETA PARA FILTRAR MÉTODOS
const preferenceData = {
  items: [
    {
      title: descricao,
      quantity: 1,
      currency_id: "BRL",
      unit_price: Number(valor)
    }
  ],
  back_urls: {
    success: valor === 5.00 
      ? "https://deixacomigoweb.netlify.app/sucesso"
      : "https://deixacomigoweb.netlify.app/sucesso2",
    failure: "https://deixacomigoweb.netlify.app/",
    pending: "https://deixacomigoweb.netlify.app/"
  },
  auto_return: "approved"
};

// ✅ FILTRO MAIS EFETIVO
if (metodo === "pix") {
  preferenceData.payment_methods = {
    excluded_payment_methods: [
      { id: "visa" },
      { id: "master" },
      { id: "amex" },
      { id: "elo" },
      { id: "hipercard" }
    ],
    excluded_payment_types: [
      { id: "credit_card" },
      { id: "debit_card" },
      { id: "prepaid_card" }
    ],
    installments: 1
  };
} else if (metodo === "cartao") {
  preferenceData.payment_methods = {
    excluded_payment_types: [
      { id: "ticket" }, // Boleto
      { id: "pix" }, // PIX
      { id: "bank_transfer" } // Transferência
    ],
    installments: 12 // Permite parcelamento
  };
}
