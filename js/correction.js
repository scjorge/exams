import { salvarResultado, removerResultado } from "./storage.js";
import { state } from "./state.js";
import { atualizarStatus } from "./status.js";

window.corrigirQuestao =
  function (id) {

    const questao = state.provaAtual.questoes.find(q => q.id === id);

    let correta = false;

    let respostaUsuario = null;

    // ======================================
    // SINGLE
    // ======================================

    if (questao.tipo === "single") {

      const selecionada =
        document.querySelector(
          `input[name="q-${id}"]:checked`
        );

      respostaUsuario =
        selecionada?.value || null;

      correta =
        questao.respostas.includes(
          respostaUsuario
        );

      // MOSTRAR RESPOSTA CERTA

      mostrarRespostaCorretaSingle(
        questao
      );
    }

    // ======================================
    // MULTIPLE
    // ======================================

    if (questao.tipo === "multiple") {

      const selecionadas =
        [
          ...document.querySelectorAll(
            `#resposta-${id} input:checked`
          )
        ].map(i => i.value);

      respostaUsuario =
        selecionadas;

      correta =
        JSON.stringify(
          [...selecionadas].sort()
        ) ===
        JSON.stringify(
          [...questao.respostas].sort()
        );

      mostrarRespostaCorretaMultiple(
        questao
      );
    }

    // ======================================
    // DRAG DROP
    // ======================================

    if (questao.tipo === "drag_and_drop") {

      const zones = document.querySelectorAll(`#resposta-${id} .dropzone`);

      respostaUsuario = {};

      correta = true;

      zones.forEach(zone => {

        const answer =
          zone.dataset.answer;

        const selected =
          zone.dataset.selected || null;

        respostaUsuario[answer] =
          selected;

        const esperado =
          Object.keys(
            questao.respostas
          ).find(
            key =>
              questao.respostas[key] ===
              answer
          );

        if (esperado !== selected) {
          correta = false;
        }
      });
    }

    // ======================================
    // SALVAR
    // ======================================

    salvarResultado(id, {

      status:
        correta
          ? "correta"
          : "errada",

      resposta:
        respostaUsuario

    });

    // ======================================
    // CARD
    // ======================================

    const card = document.querySelector(`#resposta-${id}`)?.closest(".card");

    if (card) {
      card.classList.remove(
        "correta",
        "errada"
      );

      card.classList.add(
        correta
          ? "correta"
          : "errada"
      );
    }

    atualizarStatus();

    setTimeout(() => {

      window.revelarRespostaCorreta(
        questao,
        id
      );

    }, 50);
  };


window.removerCorrecaoQuestao = function (botao, questaoId) {
  const card = botao.closest(".card");
  const questao = state.provaAtual.questoes.find(q => q.id === questaoId);
  console.log("aosdcmaiosdcioamsdmciamdciamsd")

  card.classList.remove(
    "correta",
    "errada",
    "parcial"
  );

  if (questao.tipo === "single" || questao.tipo === "multiple") {

  }

  botao.textContent = "Corrigir";

  ocultarRespostaCorreta(questao, questaoId);
  removerResultado(questaoId);
  atualizarStatus();
}

// ======================================
// SINGLE
// ======================================

function mostrarRespostaCorretaSingle(
  questao
) {

  const inputs =
    document.querySelectorAll(
      `input[name="q-${questao.id}"]`
    );

  inputs.forEach(input => {

    const label =
      input.nextElementSibling;

    if (
      questao.respostas.includes(
        input.value
      )
    ) {

      label.classList.add(
        "text-success",
        "fw-bold"
      );

      //input.checked = true;
    }

    //input.disabled = true;
  });
}

// ======================================
// MULTIPLE
// ======================================

function mostrarRespostaCorretaMultiple(
  questao
) {

  const inputs =
    document.querySelectorAll(
      `#resposta-${questao.id} input`
    );

  inputs.forEach(input => {

    const label =
      input.nextElementSibling;

    if (
      questao.respostas.includes(
        input.value
      )
    ) {

      label.classList.add(
        "text-success",
        "fw-bold"
      );

      //input.checked = true;
    }

    //input.disabled = true;
  });
}


// ======================================
// REVELAR RESPOSTA CORRETA
// ======================================

window.revelarRespostaCorreta = function revelarRespostaCorreta(questao, id) {

  // ======================================
  // SINGLE / MULTIPLE
  // ======================================

  if (questao.tipo === "single" || questao.tipo === "multiple") {

    const inputs =
      document.querySelectorAll(
        `#resposta-${id} input`
      );

    inputs.forEach(input => {

      const wrapper =
        input.closest(
          ".form-check"
        );

      const label =
        wrapper.querySelector(
          "label"
        );

      // limpa estilos antigos

      wrapper.classList.remove(
        "bg-success-subtle",
        "border",
        "border-success",
        "rounded",
        "p-1"
      );

      label.classList.remove(
        "text-success",
        "fw-bold"
      );

      // correta

      if (
        questao.respostas.includes(
          input.value
        )
      ) {

        wrapper.classList.add(
          "bg-success-subtle",
          "border",
          "border-success",
          "rounded",
        );

        label.classList.add(
          "text-success",
          "fw-bold"
        );
      }
    });
  }

  // ======================================
  // DRAG DROP
  // ======================================

  if (questao.tipo === "drag_and_drop") {

    const zones =
      document.querySelectorAll(
        `#resposta-${id} .dropzone`
      );

    let respostaUsuario = {};

    //correta = true;

    zones.forEach(zone => {

      const answer =
        zone.dataset.answer;

      const selected =
        zone.dataset.selected || null;

      respostaUsuario[answer] =
        selected;

      const esperado =
        Object.keys(
          questao.respostas
        ).find(
          key =>
            questao.respostas[key] ===
            answer
        );

      // remove feedback antigo

      const feedbackAntigo =
        zone.querySelector(
          ".feedback-drop"
        );

      if (feedbackAntigo)
        feedbackAntigo.remove();

      // remove classes antigas

      zone.classList.remove(
        "border-success",
        "border-danger",
        "bg-success-subtle",
        "bg-danger-subtle"
      );

      // correto

      if (esperado === selected) {

        zone.classList.add(
          "border-success",
          "bg-success-subtle"
        );

      } else {

        //correta = false;

        zone.classList.add(
          "border-danger",
          "bg-danger-subtle"
        );
      }

      // texto correto

      const pergunta =
        questao.pergunta_opcoes.find(
          op =>
            Object.keys(op)[0] === esperado
        );

      const texto =
        pergunta?.[esperado] ||
        esperado;

      // feedback

      zone.innerHTML += `

      <div class="feedback-drop
                  mt-2
                  small">

        ${esperado === selected
          ? `
            <span class="text-success">

              ✓ Correto

            </span>
          `
          : `
            <span class="text-danger">

              ✗ Correto:
              <strong>${texto}</strong>

            </span>
          `
        }

      </div>
    `;
    });
  }
};



// ======================================
// OCULTAR RESPOSTA CORRETA
// ======================================

window.ocultarRespostaCorreta = function ocultarRespostaCorreta(questao, id) {

  // ======================================
  // SINGLE / MULTIPLE
  // ======================================

  if (questao.tipo === "single" || questao.tipo === "multiple") {

    const inputs = document.querySelectorAll(`#resposta-${id} input`);

    inputs.forEach(input => {
      const wrapper = input.closest(".form-check");
      const label = wrapper.querySelector("label");
      input.checked = false;

      wrapper.classList.remove(
        "bg-success-subtle",
        "border",
        "border-success",
        "rounded",
        "p-1"
      );

      label.classList.remove(
        "text-success",
        "fw-bold"
      );
    });
  }

  // ======================================
  // DRAG DROP
  // ======================================

  if (questao.tipo === "drag_and_drop") {

    const zones = document.querySelectorAll(`#resposta-${id} .dropzone`);

    zones.forEach(zone => {

      // remove seleção
      delete zone.dataset.selected;

      // remove feedback
      const feedback = zone.querySelector(".feedback-drop");

      if (feedback)
        feedback.remove();

      // remove classes
      zone.classList.remove(
        "border-success",
        "border-danger",
        "bg-success-subtle",
        "bg-danger-subtle"
      );

      // limpa conteúdo dropado
      zone.innerHTML = "";
    });

    // volta itens para origem
    const container = document.querySelector(`#resposta-${id}`);
    ativarDragDrop(container);
  }
};