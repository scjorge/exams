import { toggleRevisao } from "./storage.js";
import { renderizarQuestoes } from "./render.js";

window.toggleQuestaoRevisao =
    function (id) {

        toggleRevisao(id);

        renderizarQuestoes();
    };