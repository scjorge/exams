import { state } from "./state.js";

import { renderizarQuestoes, extrairQuestoesComTermosUnicos } from "./render.js";


// ======================================
// RANDOM
// ======================================

export function inicializarActions() {
    // RANDOM
    document.getElementById("btnRandom").addEventListener("click", randomizarQuestoes);

    // RESET
    document.getElementById("btnReset").addEventListener("click", resetarProgresso);

    // MAPA
    document.getElementById("btnMapa").addEventListener("click", gerarMapaRespostas);

    // MAPA Termos Respostas
    document.getElementById("btnTermosRespostas").addEventListener("click", gerarMapaTermosRespostas);
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
            "Resetar progresso? Isso inclui apagar as questões marcadas para revisão e as respostas salvas."
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
    const modalMapaBody = document.getElementById("modalMapaBody");
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


function obterRespostasCorretas(questao) {

    const respostas = [];

    // SINGLE / MULTIPLE / BLANK
    if (Array.isArray(questao.respostas)) {

        questao.respostas.forEach(key => {

            const opcao = questao.opcoes.find(
                o => Object.keys(o)[0] === key
            );

            if (opcao) {
                respostas.push(
                    opcao[key]
                );
            }
        });
    }

    // DRAG & DROP
    else if (questao.tipo === "drag_and_drop") {

        Object.entries(questao.respostas)
            .forEach(([origem, destino]) => {

                const origemObj =
                    questao.pergunta_opcoes.find(
                        o => Object.keys(o)[0] === origem
                    );

                const destinoObj =
                    questao.opcoes.find(
                        o => Object.keys(o)[0] === destino
                    );

                if (origemObj && destinoObj) {

                    respostas.push(
                        `${origemObj[origem]} → ${destinoObj[destino]}`
                    );
                }
            });
    }

    return respostas;
}


function gerarMapaTermosRespostas() {
    const questoesComTermosUnicos = extrairQuestoesComTermosUnicos(state.provaAtual);
    const modalMapaBody = document.getElementById("modalTermoRespostasBody");
    modalMapaBody.innerHTML = "";

    questoesComTermosUnicos.forEach((q, i) => {
        const questao = q.pergunta;
        const respostas = obterRespostasCorretas(questao);

        modalMapaBody.innerHTML += `

        <div class="card shadow-sm mb-3">

            <div class="card-header">

                <button
                    class="btn btn-link text-decoration-none w-100 text-start"
                    data-bs-toggle="collapse"
                    data-bs-target="#resp${i}">

                    <div class="fw-bold fs-5">
                        ${q.termoChave}
                    </div>

                    <small class="text-muted ">
                        ${questao.tipo}
                    </small>

                </button>

            </div>

            <div
                id="resp${i}"
                class="collapse">

                <div class="card-body">

                    <div class="mb-3">

                        <div class="text-muted small">
                            PERGUNTA
                        </div>

                        <div>
                            ${questao.pergunta?.texto || ""}
                        </div>

                    </div>

                    <div>

                        <div class="text-muted small">
                            RESPOSTAS
                        </div>

                        <ul class="list-group mt-2">

                            ${respostas.map(r => `
                                <li class="list-group-item list-group-item-success">
                                    ${r}
                                </li>
                            `).join("")}

                        </ul>

                    </div>

                </div>

            </div>

        </div>

    `;
    });


}