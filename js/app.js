const formObservacao = document.querySelector("#formObservacao");
const mensagemFormulario = document.querySelector("#mensagemFormulario");
const listaObservacoes = document.querySelector("#listaObservacoes");

const totalRegistros = document.querySelector("#totalRegistros");
const registrosPositivos = document.querySelector("#registrosPositivos");
const alertasAmbientais = document.querySelector("#alertasAmbientais");
const indiceEcoPorto = document.querySelector("#indiceEcoPorto");
const classificacaoEcoPorto = document.querySelector("#classificacaoEcoPorto");

// Pequeno cuidado para deixar as datas mais agradáveis na tela.
function formatarData(data) {
  return new Date(data).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
}

async function carregarDashboard() {
  try {
    const resposta = await fetch("/api/dashboard");
    const dados = await resposta.json();

    totalRegistros.textContent = dados.totalRegistros;
    registrosPositivos.textContent = dados.registrosPositivos;
    alertasAmbientais.textContent = dados.alertasAmbientais;
    indiceEcoPorto.textContent = dados.indiceEcoPorto;
    classificacaoEcoPorto.textContent = dados.classificacao;
  } catch (error) {
    console.log("Erro ao carregar dashboard:", error);
  }
}

async function carregarObservacoes() {
  try {
    const resposta = await fetch("/api/observacoes");
    const observacoes = await resposta.json();

    atualizarEstatisticas(registros);


    if (!observacoes.length) {
      listaObservacoes.innerHTML = `
        <p class="vazio">
          Ainda não há observações cadastradas. Faça o primeiro registro de Porto Camargo.
        </p>
      `;

      return;
    }

    listaObservacoes.innerHTML = observacoes
      .map((item) => {
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
              <strong>Responsável:</strong> ${item.responsavel || "Comunidade"}<br>
              <strong>Data:</strong> ${formatarData(item.data_registro)}
            </div>

            <button class="botao-remover" onclick="removerObservacao(${item.id})">
              Remover
            </button>
          </article>
        `;
      })
      .join("");
  } catch (error) {
    listaObservacoes.innerHTML = `
      <p class="vazio">
        Não foi possível carregar os registros agora.
      </p>
    `;

    console.log("Erro ao carregar observações:", error);
  }
}

async function removerObservacao(id) {
  const confirmar = confirm("Deseja remover esta observação?");

  if (!confirmar) {
    return;
  }

  try {
    await fetch(`/api/observacoes/${id}`, {
      method: "DELETE"
    });

    await carregarObservacoes();
    await carregarDashboard();
  } catch (error) {
    alert("Não foi possível remover a observação.");
    console.log("Erro ao remover:", error);
  }
}

formObservacao.addEventListener("submit", async (event) => {
  event.preventDefault();

  const dadosFormulario = new FormData(formObservacao);

  const novaObservacao = {
    titulo: dadosFormulario.get("titulo"),
    tipo: dadosFormulario.get("tipo"),
    descricao: dadosFormulario.get("descricao"),
    nivel_cuidado: dadosFormulario.get("nivel_cuidado"),
    localizacao: dadosFormulario.get("localizacao"),
    responsavel: dadosFormulario.get("responsavel")
  };

  try {
    const resposta = await fetch("/api/observacoes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(novaObservacao)
    });

    const resultado = await resposta.json();

    if (!resposta.ok) {
      mensagemFormulario.textContent = resultado.erro || "Erro ao salvar.";
      mensagemFormulario.style.color = "#991b1b";
      return;
    }

    mensagemFormulario.textContent = "Observação salva com sucesso!";
    mensagemFormulario.style.color = "#0f766e";

    formObservacao.reset();

    // Deixei a localização preenchida de novo porque o projeto é focado em Porto Camargo.
    formObservacao.localizacao.value = "Porto Camargo - Icaraíma";

    await carregarObservacoes();
    await carregarDashboard();
  } catch (error) {
    mensagemFormulario.textContent = "Erro de conexão com o servidor.";
    mensagemFormulario.style.color = "#991b1b";

    console.log("Erro no formulário:", error);
  }
});

carregarDashboard();
carregarObservacoes();
