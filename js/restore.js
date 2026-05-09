import {
  getResultado
} from "./storage.js";

export function restaurarResposta(
  questao
) {

  const resultado =
    getResultado(questao.id);

  if (!resultado)
    return;

  let resposta =
    resultado.resposta;

  // ======================================
  // SINGLE
  // ======================================

  if (questao.tipo === "single") {

    const input =
      document.querySelector(
        `input[name="q-${questao.id}"][value="${resposta}"]`
      );

    if (input) {

      input.checked = true;
    }
  }

  // ======================================
  // MULTIPLE
  // ======================================

  if (questao.tipo === "multiple") {

    if (!Array.isArray(resposta))
      resposta = [];

    resposta.forEach(valor => {

      const input =
        document.querySelector(
          `#resposta-${questao.id} input[value="${valor}"]`
        );

      if (input) {

        input.checked = true;
      }
    });
  }

  // ======================================
  // BLANK
  // ======================================

  if (questao.tipo === "blank") {

    if (
      resultado.status ===
      "correta"
    ) {

      setTimeout(() => {

        if (
          window.mostrarRespostaBlank
        ) {

          window.mostrarRespostaBlank(
            questao.id
          );
        }

      }, 0);
    }
  }

  // ======================================
  // DRAG DROP
  // ======================================

  if (
    questao.tipo ===
    "drag_and_drop"
  ) {

    setTimeout(() => {

      Object.entries(
        resposta || {}
      ).forEach(
        ([answer, selected]) => {

          const zone =
            document.querySelector(
              `#resposta-${questao.id} .dropzone[data-answer="${answer}"]`
            );

          if (!zone)
            return;

          const pergunta =
            questao.pergunta_opcoes.find(
              op =>
                Object.keys(op)[0] ===
                selected
            );

          if (!pergunta)
            return;

          const texto =
            pergunta[selected];

          zone.innerHTML = `
            <div class="card p-2 mb-2 draggable-item"
                 draggable="true"
                 data-key="${selected}">

              ${texto}

            </div>
          `;

          zone.dataset.selected =
            selected;
        }
      );

    }, 0);
  }

  // ======================================
  // STATUS VISUAL
  // ======================================

  const card =
    document.querySelector(
      `#resposta-${questao.id}`
    )?.closest(".card");

  if (!card)
    return;

  // correta / errada

  if (resultado.status) {

    card.classList.add(
      resultado.status
    );
  }

  // revisão

  if (resultado.revisao) {

    card.classList.add(
      "revisao"
    );
  }

  if (
    resultado.status
  ) {

    setTimeout(() => {

      if (
        window.revelarRespostaCorreta
      ) {

        window.revelarRespostaCorreta(
          questao,
          questao.id
        );
      }

    }, 0);
  }
}

