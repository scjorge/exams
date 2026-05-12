export function getResultado(id) {

  const raw = localStorage.getItem(`resultado_${id}`);

  if (!raw)
    return null;

  try {

    return JSON.parse(raw);

  } catch {

    return null;
  }
}

export function salvarResultado(id, data) {
  console.log("Salvando resultado", id, data);

  const atual =
    getResultado(id) || {};

  const atualizado = {

    ...atual,

    ...data

  };

  localStorage.setItem(`resultado_${id}`, JSON.stringify(atualizado));
}


export function removerResultado(id) {
  localStorage.removeItem(`resultado_${id}`);
}

export function toggleRevisao(id) {

  const resultado =
    getResultado(id) || {};

  resultado.revisao =
    !resultado.revisao;

  localStorage.setItem(
    `resultado_${id}`,
    JSON.stringify(resultado)
  );

  return resultado.revisao;
}