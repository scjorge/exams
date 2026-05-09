import { state } from "./state.js";
import { getResultado } from "./storage.js";
import { restaurarResposta } from "./restore.js";
import { aplicarFiltros } from "./filters.js";
import { ativarDragDrop } from "./dragdrop.js";
import { atualizarStatus } from "./status.js";


// ======================================
// RENDER PERGUNTA
// ======================================

function renderizarPergunta(pergunta) {
  if (typeof pergunta === "string") {
    return `
      ${pergunta}
    `;
  }

  // formato novo

  return `

    <div class="pergunta-wrap">

      <div class="pergunta-texto">

        ${pergunta.texto || ""}

      </div>

      ${pergunta.imagem
      ? `
          <div class="mt-3">

            <img
              src="${state.provaAtual.mediaURLBase}${pergunta.imagem}"
              class="img-fluid rounded border shadow-sm pergunta-imagem">

          </div>
        `
      : ""
    }

    </div>
  `;
}

export function renderizarQuestoes() {

  document.getElementById("provaTitulo").innerHTML = state.provaAtual.nome;

  const questoesDiv = document.getElementById("questoes");

  questoesDiv.innerHTML = "";

  // ======================================
  // APLICAR FILTROS
  // ======================================

  let questoes =
    aplicarFiltros([
      ...state.provaAtual.questoes
    ]);

  // ======================================
  // SALVAR FILTRADAS
  // ======================================

  state.questoesFiltradas =
    questoes;

  // ======================================
  // PAGINAÇÃO
  // ======================================

  const inicio =
    (state.paginaAtual - 1) *
    state.itensPorPagina;

  const fim =
    inicio + state.itensPorPagina;

  questoes =
    questoes.slice(inicio, fim);

  // ======================================
  // RENDER
  // ======================================

  questoes.forEach((questao, i) => {

    const card =
      document.createElement("div");

    card.className =
      "card mb-4";

    const resultado =
      getResultado(questao.id);

    if (resultado?.status) {

      card.classList.add(
        resultado.status
      );
    }

    if (resultado?.revisao) {

      card.classList.add(
        "revisao"
      );
    }

    card.innerHTML = `
      <div class="card-body">

        <div class="d-flex justify-content-between">

          <span class="badge bg-primary">
            ${questao.tipo}
          </span>

          <span class="badge bg-secondary">
            ${questao.categoria}
          </span>

          ${questao.subcategoria
            ? `
              <span class="badge bg-info text-dark">
                ${questao.subcategoria}
              </span>
            `
            : ""
          }

        </div>

        <small class="text-muted">
          ${questao.fonte}
        </small>

        <h5 class="mt-3">

          #${inicio + i + 1}

          ${renderizarPergunta(questao.pergunta)}

        </h5>

        <div id="resposta-${questao.id}">
        </div>

        ${questao.tipo !== "blank"
        ? `
            <div class="d-flex gap-2 mt-3">

              ${questao.tipo !== "blank"
          ? `
                  <button class="btn btn-success"
                          onclick="corrigirQuestao('${questao.id}')">

                    Corrigir

                  </button>
                `
          : ""
        }

              <button class="btn btn-warning"
                      onclick="toggleQuestaoRevisao('${questao.id}')">

                ${resultado?.revisao
          ? "Remover Revisão"
          : "Marcar Revisão"}

              </button>

            </div>
        `
        : ""
      }

      </div>
    `;

    questoesDiv.appendChild(card);

    const respostaDiv =
      document.getElementById(
        `resposta-${questao.id}`
      );

    renderizarTipo(
      questao,
      respostaDiv
    );

    restaurarResposta(questao);
  });

  atualizarStatus();
  renderizarPaginacao();

}

// ======================================
// PAGINAÇÃO
// ======================================

function renderizarPaginacao() {

  const paginacao =
    document.getElementById(
      "paginacao"
    );

  paginacao.innerHTML = "";

  const totalPaginas =
    Math.ceil(
      state.questoesFiltradas.length /
      state.itensPorPagina
    );

  for (let i = 1; i <= totalPaginas; i++) {

    const btn =
      document.createElement("button");

    btn.className =
      i === state.paginaAtual
        ? "btn btn-primary btn-sm"
        : "btn btn-outline-primary btn-sm";

    btn.textContent = i;

    btn.onclick = () => {

      state.paginaAtual = i;

      renderizarQuestoes();
    };

    paginacao.appendChild(btn);
  }
}

// ======================================
// RENDER TIPO
// ======================================

function renderizarTipo(
  questao,
  container
) {

  // ======================================
  // SINGLE
  // ======================================

  if (questao.tipo === "single") {

    questao.opcoes.forEach(op => {

      const key =
        Object.keys(op)[0];

      const value =
        op[key];

      container.innerHTML += `
        <div class="form-check">

          <input class="form-check-input"
                 type="radio"
                 name="q-${questao.id}"
                 value="${key}">

          <label class="form-check-label">
            ${value}
          </label>

        </div>
      `;
    });
  }

  // ======================================
  // MULTIPLE
  // ======================================

  if (questao.tipo === "multiple") {

    questao.opcoes.forEach(op => {

      const key =
        Object.keys(op)[0];

      const value =
        op[key];

      container.innerHTML += `
        <div class="form-check">

          <input class="form-check-input"
                 type="checkbox"
                 value="${key}">

          <label class="form-check-label">
            ${value}
          </label>

        </div>
      `;
    });
  }

  // ======================================
  // BLANK
  // ======================================

  if (questao.tipo === "blank") {

    container.innerHTML = `

      <button class="btn btn-outline-primary"
              onclick="mostrarRespostaBlank('${questao.id}')">

        Revelar opções

      </button>

      <div id="blank-${questao.id}"
           class="mt-3">
      </div>
    `;
  }

  // ======================================
  // DRAG DROP
  // ======================================

  if (questao.tipo === "drag_and_drop") {

    let html =
      "<div class=\"row\">";

    // COLUNA ESQUERDA

    html += `
      <div class="col-md-6">
    `;

    questao.pergunta_opcoes
      .forEach(op => {

        const key =
          Object.keys(op)[0];

        const value =
          op[key];

        html += `
          <div class="card p-2 mb-2 draggable-item"
               draggable="true"
               data-key="${key}">

            ${value}

          </div>
        `;
      });

    html += "</div>";

    // COLUNA DIREITA

    html += `
      <div class="col-md-6">
    `;

    questao.opcoes.forEach(op => {

      const key =
        Object.keys(op)[0];

      const value =
        op[key];

      html += `
        <div class="mb-3">

          <strong>
            ${value}
          </strong>

          <div class="dropzone mt-2"
               data-answer="${key}">
          </div>

        </div>
      `;
    });

    html += `
      </div>
      </div>
    `;

    container.innerHTML = html;

    ativarDragDrop(container);
  }
}