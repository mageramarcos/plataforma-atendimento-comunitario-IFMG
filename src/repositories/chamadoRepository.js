const { conectarBanco } = require("../database/connection");

const db = conectarBanco();

function buscarCategoriaPorNome(nome) {
  return new Promise((resolve, reject) => {
    const query = "SELECT id, nome FROM categorias WHERE nome = ?";

    db.get(query, [nome], (erro, row) => {
      if (erro) {
        return reject(erro);
      }

      return resolve(row || null);
    });
  });
}

function criarChamado({
  usuarioId,
  categoriaId,
  descricao,
  cep,
  cidade,
  uf,
  prioridade,
  status,
}) {
  return new Promise((resolve, reject) => {
    const query = `
      INSERT INTO chamados (
        usuario_id,
        categoria_id,
        descricao,
        cep,
        cidade,
        uf,
        prioridade,
        status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.run(
      query,
      [usuarioId, categoriaId, descricao, cep, cidade, uf, prioridade, status],
      function onInsert(erro) {
        if (erro) {
          return reject(erro);
        }

        return resolve({
          id: this.lastID,
          usuario_id: usuarioId,
          categoria_id: categoriaId,
          descricao,
          cep,
          cidade,
          uf,
          prioridade,
          status,
        });
      },
    );
  });
}

module.exports = {
  buscarCategoriaPorNome,
  criarChamado,
};
