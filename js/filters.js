import { state } from "./state.js";
import { renderizarQuestoes } from "./render.js";
import { getResultado } from "./storage.js";

// ======================================
// ELEMENTOS
// ======================================

const filtroTipo =
  document.getElementById(
    "filtroTipo"
  );

const filtroCategoria =
  document.getElementById(
    "filtroCategoria"
  );

const filtroSubcategoria =
  document.getElementById(
    "filtroSubcategoria"
  );

const filtroFonte =
  document.getElementById(
    "filtroFonte"
  );

const buscaKeyword =
  document.getElementById(
    "buscaKeyword"
  );

const somenteErradas =
  document.getElementById(
    "somenteErradas"
  );

const somenteRevisao =
  document.getElementById(
    "somenteRevisao"
  );

// ======================================
// INIT
// ======================================

export function inicializarFiltros() {

  preencherFiltros();

  // ======================================
  // SELECTS
  // ======================================

  [
    filtroTipo,
    filtroFonte,
    somenteErradas,
    somenteRevisao,
    filtroSubcategoria
  ].forEach(el => {

    el.addEventListener(
      "change",
      () => {

        state.paginaAtual = 1;

        renderizarQuestoes();
      }
    );
  });

  // ======================================
  // CATEGORIA
  // ======================================

  filtroCategoria.addEventListener(
    "change",
    () => {

      // limpa subcategoria atual

      filtroSubcategoria.value = "";

      // atualiza lista

      atualizarSubcategorias();

      state.paginaAtual = 1;

      renderizarQuestoes();
    }
  );

  // BUSCA

  buscaKeyword.addEventListener(
    "input",
    () => {

      state.paginaAtual = 1;

      renderizarQuestoes();
    }
  );
}

// ======================================
// PREENCHER
// ======================================

function preencherFiltros() {

  preencherSelect(
    filtroTipo,
    [
      ...new Set(
        state.provaAtual.questoes.map(
          q => q.tipo
        )
      )
    ]
  );

  preencherSelect(
    filtroCategoria,

    [
      ...new Set(
        state.provaAtual.questoes.map(
          q => q.categoria
        )
      )
    ]
  );

  atualizarSubcategorias();

  preencherSelect(
    filtroFonte,
    [
      ...new Set(
        state.provaAtual.questoes.map(
          q => q.fonte
        )
      )
    ]
  );
}

function preencherSelect(
  select,
  items
) {

  select.innerHTML =
    `<option value="">
      Todos
    </option>`;

  (items || []).forEach(item => {

    const option =
      document.createElement(
        "option"
      );

    option.value = item;

    option.textContent = item;

    select.appendChild(option);
  });
}

// ======================================
// APLICAR
// ======================================

export function aplicarFiltros(
  questoes
) {

  // TIPO

  if (filtroTipo.value) {

    questoes =
      questoes.filter(
        q =>
          q.tipo ===
          filtroTipo.value
      );
  }

  // CATEGORIA

  if (filtroCategoria.value) {

    questoes =
      questoes.filter(
        q =>
          q.categoria ===
          filtroCategoria.value
      );
  }

  // SUB CATEGORIA

  if (filtroSubcategoria.value) {

    questoes =
      questoes.filter(
        q =>
          q.subcategoria ===
          filtroSubcategoria.value
      );
  }

  // FONTE

  if (filtroFonte.value) {

    questoes =
      questoes.filter(
        q =>
          q.fonte ===
          filtroFonte.value
      );
  }

  // BUSCA

  const keyword =
    buscaKeyword.value
      .toLowerCase()
      .trim();

  if (keyword) {

    questoes =
      questoes.filter(q => {

        const texto = typeof q.pergunta === "string" ? q.pergunta : q.pergunta?.texto || "";
        const pergunta = texto.toLowerCase();

        const opcoes = JSON.stringify(q.opcoes).toLowerCase();
        const pergunta_opcoes = q.pergunta_opcoes ? JSON.stringify(q.pergunta_opcoes).toLowerCase() : [];

        return (pergunta.includes(keyword) || opcoes.includes(keyword) || pergunta_opcoes.includes(keyword));
      });
  }

  // ERRADAS

  if (somenteErradas.checked) {

    questoes =
      questoes.filter(q => {

        const resultado =
          getResultado(q.id);

        return (
          resultado?.status ===
          "errada"
        );
      });
  }

  if (somenteRevisao.checked) {

    questoes =
      questoes.filter(q => {

        const resultado =
          getResultado(q.id);

        return resultado?.revisao;
      });
  }
  return questoes;
}


// ======================================
// ATUALIZAR SUBCATEGORIAS
// ======================================

function atualizarSubcategorias() {

  let questoes =
    state.provaAtual.questoes;

  // filtra pela categoria selecionada

  if (filtroCategoria.value) {

    questoes =
      questoes.filter(
        q =>
          q.categoria ===
          filtroCategoria.value
      );
  }

  // gera subcategorias válidas

  const subcategorias =
    [
      ...new Set(
        questoes
          .map(
            q => q.subcategoria
          )
          .filter(Boolean)
      )
    ];

  // limpa select

  preencherSelect(
    filtroSubcategoria,
    subcategorias
  );
}