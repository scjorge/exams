import "./correction.js";
import "./blank.js";
import "./review.js";
import { state } from "./state.js";
import { carregarProvas } from "./loader.js";
import { renderizarQuestoes } from "./render.js";
import { inicializarFiltros } from "./filters.js";
import { inicializarActions } from "./actions.js";
import { inicializarProvas } from "./provas.js";

window.addEventListener(
    "DOMContentLoaded",
    async () => {

        // carregar provas

        state.provas =
            await carregarProvas();

        // primeira prova

        state.provaAtual =
            state.provas[0];

        // init

        inicializarProvas();

        inicializarFiltros();

        inicializarActions();

        renderizarQuestoes();
    }
);