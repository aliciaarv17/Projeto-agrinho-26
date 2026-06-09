const mensagemFormulario = document.querySelector("#mensagemFormulario");
const listaObservacoes = document.querySelector("#listaObservacoes");

const totalRegistros = document.querySelector("#totalRegistros");
const registrosPositivos = document.querySelector("#registrosPositivos");
const alertasAmbientais = document.querySelector("#alertasAmbientais");
const indiceEcoPorto = document.querySelector("#indiceEcoPorto");
const classificacaoEcoPorto = document.querySelector("#classificacaoEcoPorto");

function formatarData(data) {
  return new Date(data).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
}

const observacoes = [
  {
    id: 1,
    titulo: "Mutirão de Limpeza",
    tipo: "Positivo",
    descricao:
      "Moradores realizaram limpeza das margens do rio e recolheram resíduos descartados irregularmente.",
    nivel_cuidado: "Baixo",
    localizacao: "Porto Camargo - Icaraíma",
    responsavel: "Comunidade",
    data_registro: "2026-05-15"
  },
  {
    id: 2,
    titulo: "Descarte Irregular",
    tipo: "Alerta",
    descricao:
      "Foi identificado descarte de lixo em área próxima ao porto.",
    nivel_cuidado: "Alto",
    localizacao: "Porto Camargo - Icaraíma",
    responsavel: "Moradores",
    data_registro: "2026-05-22"
  },
  {
    id: 3,
    titulo: "Plantio de Mudas",
    tipo: "Positivo",
    descricao:
      "Ação escolar promoveu o plantio de espécies nativas na região.",
    nivel_cuidado: "Baixo",
    localizacao: "Porto Camargo - Icaraíma",
    responsavel: "Escola Local",
    data_registro: "2026-05-28"
  }
];

function carregarDashboard() {
  totalRegistros.textContent = observacoes.length;

  const positivos = observacoes.filter(
    item => item.tipo.toLowerCase() === "positivo"
  ).length;

  const alertas = observacoes.filter(
    item => item.tipo.toLowerCase() === "alerta"
  ).length;

  registrosPositivos.textContent = positivos;
  alertasAmbientais.textContent = alertas;

  const indice = Math.round(
    (positivos / observacoes.length) * 100
  );

  indiceEcoPorto.textContent = indice + "%";

  classificacaoEcoPorto.textContent =
    indice >= 70 ? "Excelente" :
    indice >= 50 ? "Boa" :
    "Necessita Atenção";
}

function carregarObservacoes() {
  listaObservacoes.innerHTML = observacoes
    .map(item => {
      return `
        <article class="observacao-card">
          <div class="observacao-topo">
            <h3>${item.titulo}</h3>
          </div>

          <span class="tag">${item.tipo}</span>

          <p>${item.descricao}</p>

          <div class="observacao-meta">
            <strong>Nível:</strong> ${item.nivel_cuidado}<br>
            <strong>Local:</strong> ${item.localizacao}<br>
            <strong>Responsável:</strong> ${item.responsavel}<br>
            <strong>Data:</strong> ${formatarData(item.data_registro)}
          </div>
        </article>
      `;
    })
    .join("");
}

carregarDashboard();
carregarObservacoes();