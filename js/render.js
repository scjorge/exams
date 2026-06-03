import { state } from "./state.js";
import { getResultado } from "./storage.js";
import { restaurarResposta } from "./restore.js";
import { aplicarFiltros } from "./filters.js";
import { ativarDragDrop } from "./dragdrop.js";
import { atualizarStatus } from "./status.js";


// ======================================
// PALAVRAS ÚNICAS
// ======================================

let termosUnicos = new Set();

function gerarIndicePalavras() {

  const contador = {};

  state.provaAtual.questoes.forEach(questao => {

    let texto = "";

    if (typeof questao.pergunta === "string") {
      texto = questao.pergunta;
    } else {
      texto = questao.pergunta?.texto || "";
    }

    const palavras = texto
      .toLowerCase()
      .replace(/[^\w\s]/g, " ")
      .split(/\s+/)
      .filter(p => p.length >= 2);

    // unigramas
    palavras.forEach(p => {
      contador[p] = (contador[p] || 0) + 1;
    });

    // bigramas
    for (let i = 0; i < palavras.length - 1; i++) {
      const termo = palavras[i] + " " + palavras[i + 1];
      contador[termo] = (contador[termo] || 0) + 1;
    }

    // trigramas
    for (let i = 0; i < palavras.length - 2; i++) {
      const termo = palavras[i] + " " + palavras[i + 1] + " " + palavras[i + 2];
      contador[termo] = (contador[termo] || 0) + 1;
    }

  });

  termosUnicos = new Set(
    Object.keys(contador)
      .filter(k => contador[k] === 1)
  );
}

function destacarPalavrasUnicas(texto) {

  const palavras = texto.split(/\s+/);

  let resultado = [];
  let i = 0;

  while (i < palavras.length) {

    // tenta trigrama
    if (i + 2 < palavras.length) {

      const trig =
        (
          palavras[i] + " " +
          palavras[i + 1] + " " +
          palavras[i + 2]
        ).toLowerCase();

      if (termosUnicos.has(trig)) {

        resultado.push(
          `<span class="text-danger fw-bold">
            ${palavras[i]} ${palavras[i + 1]} ${palavras[i + 2]}
          </span>`
        );

        i += 3;
        continue;
      }
    }

    // tenta bigrama
    if (i + 1 < palavras.length) {

      const big =
        (
          palavras[i] + " " +
          palavras[i + 1]
        ).toLowerCase();

      if (termosUnicos.has(big)) {

        resultado.push(
          `<span class="text-danger fw-bold">
            ${palavras[i]} ${palavras[i + 1]}
          </span>`
        );

        i += 2;
        continue;
      }
    }

    // tenta unigrama
    const uni =
      palavras[i]
        .toLowerCase()
        .replace(/[^\w]/g, "");

    if (termosUnicos.has(uni)) {

      resultado.push(
        `<span class="text-danger fw-bold">
          ${palavras[i]}
        </span>`
      );
    } else {
      resultado.push(palavras[i]);
    }

    i++;
  }

  return resultado.join(" ");
}


function renderizarPergunta(pergunta) {
  if (typeof pergunta === "string") {
    return destacarPalavrasUnicas(pergunta);
  }

  return `
    <div class="pergunta-wrap">

      <div class="pergunta-texto">
        ${destacarPalavrasUnicas(pergunta.texto || "")}

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

// ======================================
// RENDER PERGUNTA
// ======================================
export function renderizarQuestoes() {
  gerarIndicePalavras();
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
            <button class="btn btn-success btn-corrigir"
                    data-id="${questao.id}"
                    onclick="toggleCorrecao(this, '${questao.id}')">

              ${resultado?.status
            ? "Remover Correção"
            : "Corrigir"}

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

  const paginacao = document.getElementById("paginacao");

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
      window.scrollTo(0, 0);
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

window.toggleCorrecao = function (botao, questaoId) {
  const card = botao.closest(".card");

  // já corrigida → remover correção
  if (card.classList.contains("correta") || card.classList.contains("errada")) {
    removerCorrecaoQuestao(botao, questaoId);
    return;
  } else {
    corrigirQuestao(questaoId);
  }

  botao.textContent = "Remover Correção";
};
