export async function carregarProvas() {

    // lista arquivos

    const response =
        await fetch("./data/index.json");

    const arquivos =
        await response.json();

    // carrega todos jsons

    const provas =
        await Promise.all(
            arquivos.map(async arquivo => {
                const response = await fetch(`./data/provas/${arquivo}/questions.json`);
                const data = await response.json();
                data.mediaURLBase = `./data/provas/${arquivo}/media/`;
                return data;
            })
        );

    // gerar ids

    provas.forEach(prova => {
        prova.questoes =
            prova.questoes.map((q, i) => ({

                ...q,

                id: `${prova.nome}_${i}`
                    .replace(/\s+/g, "_")
                    .replace(/[^\w]/g, "")

            }));
    });

    return provas;
}
