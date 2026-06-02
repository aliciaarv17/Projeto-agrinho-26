const express = require("express");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const fs = require("fs");

const app = express();
const PORT = 3000;

// Mantive o banco dentro da pasta database para ficar organizado.
const databaseFolder = path.join(__dirname, "database");
const databasePath = path.join(databaseFolder, "ecoporto.db");

if (!fs.existsSync(databaseFolder)) {
  fs.mkdirSync(databaseFolder);
}

const db = new sqlite3.Database(databasePath);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Arquivos do site: HTML, CSS, JS e imagens.
app.use(express.static(path.join(__dirname, "public")));

// Criação da tabela principal.
// A ideia é registrar observações reais ou educativas sobre Porto Camargo.
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS observacoes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      titulo TEXT NOT NULL,
      tipo TEXT NOT NULL,
      descricao TEXT NOT NULL,
      nivel_cuidado TEXT NOT NULL,
      localizacao TEXT NOT NULL,
      responsavel TEXT,
      data_registro TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

// Função simples para calcular o impacto de cada observação.
function calcularPontuacaoPorTipo(tipo) {
  const pontos = {
    "Água limpa": 10,
    "Mata ciliar preservada": 10,
    "Boa prática sustentável": 10,
    "Agro sustentável": 10,
    "Ponto turístico organizado": 6,
    "Educação ambiental": 8,
    "Lixo encontrado": -10,
    "Área que precisa de cuidado": -8,
    "Risco ambiental": -12
  };

  return pontos[tipo] || 0;
}

function classificarIndice(indice) {
  if (indice >= 85) {
    return "Porto Camargo Sustentável";
  }

  if (indice >= 70) {
    return "Situação Boa";
  }

  if (indice >= 50) {
    return "Atenção Moderada";
  }

  if (indice >= 30) {
    return "Alerta Ambiental";
  }

  return "Situação Crítica";
}

// Página principal.
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Lista todas as observações cadastradas.
app.get("/api/observacoes", (req, res) => {
  db.all(
    "SELECT * FROM observacoes ORDER BY id DESC",
    [],
    (error, rows) => {
      if (error) {
        return res.status(500).json({
          erro: "Não foi possível buscar as observações."
        });
      }

      res.json(rows);
    }
  );
});

// Cadastra uma nova observação.
app.post("/api/observacoes", (req, res) => {
  const {
    titulo,
    tipo,
    descricao,
    nivel_cuidado,
    localizacao,
    responsavel
  } = req.body;

  if (!titulo || !tipo || !descricao || !nivel_cuidado || !localizacao) {
    return res.status(400).json({
      erro: "Preencha todos os campos obrigatórios."
    });
  }

  const query = `
    INSERT INTO observacoes 
    (titulo, tipo, descricao, nivel_cuidado, localizacao, responsavel)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.run(
    query,
    [
      titulo.trim(),
      tipo.trim(),
      descricao.trim(),
      nivel_cuidado.trim(),
      localizacao.trim(),
      responsavel ? responsavel.trim() : "Comunidade"
    ],
    function (error) {
      if (error) {
        return res.status(500).json({
          erro: "Erro ao salvar a observação."
        });
      }

      res.status(201).json({
        mensagem: "Observação cadastrada com sucesso.",
        id: this.lastID
      });
    }
  );
});

// Remove uma observação.
// Para projeto escolar, deixei simples. Em uma versão real, teria login de administrador.
app.delete("/api/observacoes/:id", (req, res) => {
  const { id } = req.params;

  db.run("DELETE FROM observacoes WHERE id = ?", [id], function (error) {
    if (error) {
      return res.status(500).json({
        erro: "Erro ao remover observação."
      });
    }

    res.json({
      mensagem: "Observação removida com sucesso."
    });
  });
});

// Dashboard com resumo e Índice EcoPorto.
app.get("/api/dashboard", (req, res) => {
  db.all("SELECT * FROM observacoes", [], (error, rows) => {
    if (error) {
      return res.status(500).json({
        erro: "Não foi possível gerar o dashboard."
      });
    }

    let somaImpactos = 0;
    let registrosPositivos = 0;
    let alertasAmbientais = 0;

    rows.forEach((item) => {
      const impacto = calcularPontuacaoPorTipo(item.tipo);
      somaImpactos += impacto;

      if (impacto > 0) {
        registrosPositivos++;
      }

      if (impacto < 0) {
        alertasAmbientais++;
      }
    });

    // Começa em 60 para representar uma situação inicial equilibrada.
    // As observações positivas ou negativas alteram esse índice.
    let indiceEcoPorto = 60 + somaImpactos;

    if (indiceEcoPorto > 100) {
      indiceEcoPorto = 100;
    }

    if (indiceEcoPorto < 0) {
      indiceEcoPorto = 0;
    }

    res.json({
      totalRegistros: rows.length,
      registrosPositivos,
      alertasAmbientais,
      indiceEcoPorto,
      classificacao: classificarIndice(indiceEcoPorto)
    });
  });
});

app.listen(PORT, () => {
  console.log(`EcoPorto Camargo rodando em http://localhost:${PORT}`);
});
