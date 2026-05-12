import { state }
    from "./state.js";

import {
    renderizarQuestoes
} from "./render.js";

// ======================================
// RANDOM
// ======================================

export function inicializarActions() {
    // RANDOM
    document.getElementById("btnRandom").addEventListener("click",randomizarQuestoes);

    // RESET
    document.getElementById("btnReset").addEventListener("click", resetarProgresso);

    // MAPA
    document.getElementById("btnMapa").addEventListener("click",gerarMapaRespostas);
}

// ======================================
// RANDOM
// ======================================

function randomizarQuestoes() {
    for (const questao of state.provaAtual.questoes) {
        questao.opcoes.sort(() => Math.random() - 0.5);
    }

    state.provaAtual.questoes.sort(() => Math.random() - 0.5);

    state.paginaAtual = 1;

    renderizarQuestoes();
}

// ======================================
// RESET
// ======================================

function resetarProgresso() {

    const confirmar =
        confirm(
            "Resetar progresso?"
        );

    if (!confirmar)
        return;

    state.provaAtual.questoes
        .forEach(q => {

            localStorage.removeItem(
                `resultado_${q.id}`
            );
        });

    renderizarQuestoes();
}

// ======================================
// MAPA
// ======================================
function obterTextoResposta(q) {

    // SINGLE / MULTIPLE / BLANK

    if (
        q.tipo === "single" ||
        q.tipo === "multiple" ||
        q.tipo === "blank"
    ) {

        return q.respostas
            .map(resp => {

                const opcao =
                    q.opcoes.find(op =>
                        Object.keys(op)[0] === resp
                    );

                if (!opcao)
                    return resp;

                return opcao[resp];
            })
            .join(" | ");
    }

    // DRAG DROP

    if (q.tipo === "drag_and_drop") {

        return Object.entries(q.respostas)
            .map(([item, destino]) => {

                const pergunta =
                    q.pergunta_opcoes.find(
                        op =>
                            Object.keys(op)[0] === item
                    );

                const resposta =
                    q.opcoes.find(
                        op =>
                            Object.keys(op)[0] === destino
                    );

                const textoPergunta =
                    pergunta?.[item] || item;

                const textoResposta =
                    resposta?.[destino] || destino;

                return `
                    ${textoPergunta}
                    →
                    ${textoResposta}
                `;
            })
            .join(" | ");
    }

    return JSON.stringify(q.respostas);
}

function gerarMapaRespostas() {

    const modalMapaBody =
        document.getElementById(
            "modalMapaBody"
        );

    modalMapaBody.innerHTML = "";

    const mapa = {};

    state.provaAtual.questoes
        .forEach(q => {

            const respostaTexto =
                obterTextoResposta(q);

            if (!mapa[respostaTexto]) {

                mapa[respostaTexto] = [];
            }

            mapa[respostaTexto].push({
                pergunta: q.pergunta
            });
        });

    Object.keys(mapa)

        // SOMENTE REPETIDAS

        .filter(resp =>
            mapa[resp].length >= 2
        )

        .forEach((resp, i) => {

            modalMapaBody.innerHTML += `

                <div class="mb-3">

                    <button class="btn btn-outline-dark w-100"
                            data-bs-toggle="collapse"
                            data-bs-target="#resp${i}">

                        ${resp}

                    </button>

                    <div class="collapse mt-2"
                         id="resp${i}">

                        <ul class="list-group">

                            ${mapa[resp]
                                .map(p => `

                                    <li class="list-group-item">

                                        ${typeof p.pergunta === "string" ? p.pergunta : p.pergunta?.texto || ""}

                                    </li>

                                `)
                                .join("")}

                        </ul>

                    </div>

                </div>
            `;
        });
}