import { state } from "./state.js";
import { getResultado } from "./storage.js";

// ======================================
// STATUS
// ======================================

export function atualizarStatus() {

  const statusTotal =
    document.getElementById(
      "statusTotal"
    );

  const statusCorretas =
    document.getElementById(
      "statusCorretas"
    );

  const statusErradas =
    document.getElementById(
      "statusErradas"
    );

  const statusRevisao =
    document.getElementById(
      "statusRevisao"
    );

  let corretas = 0;
  let erradas = 0;
  let revisao = 0;

  // usa FILTRADAS

  state.questoesFiltradas
    .forEach(q => {

      const resultado = getResultado(q.id);

      if (resultado?.status === "correta") {
        corretas++;
      }

      if (resultado?.status === "errada") {
        erradas++;
      }

      if (resultado?.revisao) {
        revisao++;
      }
    });

  // TOTAL FILTRADO

  statusTotal.textContent = state.questoesFiltradas.length;

  statusCorretas.textContent = corretas;

  statusErradas.textContent = erradas;

  statusRevisao.textContent = revisao;
}