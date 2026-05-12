import { state } from "./state.js";

import { renderizarQuestoes } from "./render.js";

import { inicializarFiltros } from "./filters.js";

// ======================================
// ELEMENTO
// ======================================

const provaSelect = document.getElementById("provaSelect");

// ======================================
// INIT
// ======================================

export function inicializarProvas() {
  preencherSelectProvas();
  provaSelect.addEventListener("change", trocarProva);

  const provaSelecionada = localStorage.getItem(`prova_index`);
  if (provaSelecionada) {
    trocarProvaPorIndex(Number(provaSelecionada));
    provaSelect.value = provaSelecionada;
  }
}

// ======================================
// PREENCHER
// ======================================

function preencherSelectProvas() {

  provaSelect.innerHTML = "";

  state.provas.forEach((prova, index) => {

    const option = document.createElement("option");

    option.value = index;
    option.textContent = prova.nome;
    provaSelect.appendChild(option);
  });
}

// ======================================
// TROCAR
// ======================================

function trocarProva(e) {

  const index = Number(e.target.value);
  trocarProvaPorIndex(index);
}


function trocarProvaPorIndex(index) {
  state.provaAtual = state.provas[index];

  state.paginaAtual = 1;

  // recria filtros
  inicializarFiltros();

  // rerender
  renderizarQuestoes();

  localStorage.setItem(`prova_index`, index);
}