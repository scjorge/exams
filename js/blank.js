import { state }
  from "./state.js";

import {
  salvarResultado
} from "./storage.js";

window.mostrarRespostaBlank =
  function (id) {

    const questao =
      state.provaAtual.questoes.find(
        q => q.id === id
      );

    const div =
      document.getElementById(
        `blank-${id}`
      );

    if (!div)
      return;

    div.innerHTML = "";

    questao.opcoes.forEach(op => {

      const key =
        Object.keys(op)[0];

      const value =
        op[key];

      const correta =
        questao.respostas.includes(key);

      div.innerHTML += `
        <div class="form-check">

          <input class="form-check-input"
                 type="radio"
                 disabled
                 ${correta ? "checked" : ""}
                 value="${key}">

          <label class="form-check-label
                        ${correta ? "text-success fw-bold" : ""}">

            ${value}

          </label>

        </div>
      `;
    });

    // salva automaticamente como correta

    salvarResultado(id, {

      status: "correta",

      resposta:
        questao.respostas[0]

    });

    // adiciona classe verde no card

    const card =
      div.closest(".card");

    if (card) {

      card.classList.remove(
        "errada"
      );

      card.classList.add(
        "correta"
      );
    }
  };