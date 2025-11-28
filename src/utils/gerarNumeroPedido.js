// gerarNumeroPedido.js
import { doc, runTransaction } from "firebase/firestore";
import { db } from "../firebase/config";

// Gera número único e sequencial para pedidos
export async function gerarNovoNumeroPedido() {
  const pedidosRef = doc(db, "config", "pedidos");

  try {
    const novoNumero = await runTransaction(db, async (transaction) => {
      const docSnap = await transaction.get(pedidosRef);

      if (!docSnap.exists()) {
        throw new Error("Documento config/pedidos não existe!");
      }

      const ultimo = docSnap.data().ultimoNumero || 0;
      const proximo = ultimo + 1;

      // Atualiza no Firebase
      transaction.update(pedidosRef, { ultimoNumero: proximo });

      return proximo;
    });

    // Retorna como string formatada (ex: 000123)
    return novoNumero.toString().padStart(6, "0");

  } catch (error) {
    console.error("Erro ao gerar número de pedido:", error);
    throw error;
  }
}
