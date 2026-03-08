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

function buscarChamadoPorId(chamadoId) {
  return new Promise((resolve, reject) => {
    const query = "SELECT id, status FROM chamados WHERE id = ?";

    db.get(query, [chamadoId], (erro, row) => {
      if (erro) {
        return reject(erro);
      }

      return resolve(row || null);
    });
  });
}

function atualizarStatusChamado({ chamadoId, novoStatus }) {
  return new Promise((resolve, reject) => {
    const query = `
      UPDATE chamados
      SET status = ?,
          data_conclusao = CASE WHEN ? = 'CONCLUIDO' THEN CURRENT_TIMESTAMP ELSE data_conclusao END
      WHERE id = ?
    `;

    db.run(query, [novoStatus, novoStatus, chamadoId], function onUpdate(erro) {
      if (erro) {
        return reject(erro);
      }

      return resolve(this.changes);
    });
  });
}

function registrarHistoricoStatus({
  chamadoId,
  statusAnterior,
  statusNovo,
  mudadoPorUsuarioId,
  observacao,
}) {
  return new Promise((resolve, reject) => {
    const query = `
      INSERT INTO historico_status (
        chamado_id,
        status_anterior,
        status_novo,
        mudado_por_usuario_id,
        observacao
      )
      VALUES (?, ?, ?, ?, ?)
    `;

    db.run(
      query,
      [chamadoId, statusAnterior, statusNovo, mudadoPorUsuarioId, observacao],
      function onInsert(erro) {
        if (erro) {
          return reject(erro);
        }

        return resolve(this.lastID);
      },
    );
  });
}

module.exports = {
  buscarCategoriaPorNome,
  criarChamado,
  buscarChamadoPorId,
  atualizarStatusChamado,
  registrarHistoricoStatus,
};
