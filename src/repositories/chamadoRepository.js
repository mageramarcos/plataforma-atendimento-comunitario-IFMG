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

function buscarChamadoDetalhadoPorId(chamadoId) {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT
        c.id,
        c.usuario_id,
        c.categoria_id,
        c.descricao,
        c.cep,
        c.cidade,
        c.uf,
        c.prioridade,
        c.status,
        c.data_abertura,
        c.data_conclusao,
        cat.nome AS categoria
      FROM chamados c
      INNER JOIN categorias cat ON cat.id = c.categoria_id
      WHERE c.id = ?
    `;

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

function listarRelatorioChamados({ dataInicio, dataFim, status, categoria }) {
  return new Promise((resolve, reject) => {
    let query = `
      SELECT
        c.id,
        c.descricao,
        c.cep,
        c.cidade,
        c.uf,
        c.prioridade,
        c.status,
        c.data_abertura,
        c.data_conclusao,
        cat.nome AS categoria,
        u.nome AS solicitante,
        u.email AS solicitante_email
      FROM chamados c
      INNER JOIN categorias cat ON cat.id = c.categoria_id
      INNER JOIN usuarios u ON u.id = c.usuario_id
      WHERE 1 = 1
    `;

    const params = [];

    if (dataInicio) {
      query += " AND date(c.data_abertura) >= date(?)";
      params.push(dataInicio);
    }

    if (dataFim) {
      query += " AND date(c.data_abertura) <= date(?)";
      params.push(dataFim);
    }

    if (status) {
      query += " AND c.status = ?";
      params.push(status);
    }

    if (categoria) {
      query += " AND cat.nome = ?";
      params.push(categoria);
    }

    query += " ORDER BY c.data_abertura DESC";

    db.all(query, params, (erro, rows) => {
      if (erro) {
        return reject(erro);
      }

      return resolve(rows || []);
    });
  });
}

function contarChamadosPorStatus() {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT status, COUNT(*) AS total
      FROM chamados
      GROUP BY status
    `;

    db.all(query, [], (erro, rows) => {
      if (erro) {
        return reject(erro);
      }

      return resolve(rows || []);
    });
  });
}

function calcularTempoMedioConclusao() {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT AVG((julianday(data_conclusao) - julianday(data_abertura)) * 24.0) AS media_horas
      FROM chamados
      WHERE status = 'CONCLUIDO'
        AND data_conclusao IS NOT NULL
    `;

    db.get(query, [], (erro, row) => {
      if (erro) {
        return reject(erro);
      }

      return resolve(row || { media_horas: null });
    });
  });
}

function buscarCategoriaMaisRecorrente() {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT cat.nome AS categoria, COUNT(*) AS total
      FROM chamados c
      INNER JOIN categorias cat ON cat.id = c.categoria_id
      GROUP BY cat.nome
      ORDER BY total DESC
      LIMIT 1
    `;

    db.get(query, [], (erro, row) => {
      if (erro) {
        return reject(erro);
      }

      return resolve(row || null);
    });
  });
}

function atualizarChamadoComFiltros({
  chamadoId,
  descricao,
  prioridade,
  categoriaId,
  statusAtual,
  usuarioId,
  limitarPorUsuario,
}) {
  return new Promise((resolve, reject) => {
    const campos = [];
    const valores = [];

    if (descricao) {
      campos.push("descricao = ?");
      valores.push(descricao);
    }

    if (prioridade) {
      campos.push("prioridade = ?");
      valores.push(prioridade);
    }

    if (categoriaId) {
      campos.push("categoria_id = ?");
      valores.push(categoriaId);
    }

    if (campos.length === 0) {
      return resolve(0);
    }

    let query = `
      UPDATE chamados
      SET ${campos.join(", ")}
      WHERE id = ?
        AND status = ?
    `;

    valores.push(chamadoId, statusAtual);

    if (limitarPorUsuario) {
      query += " AND usuario_id = ?";
      valores.push(usuarioId);
    }

    db.run(query, valores, function onUpdate(erro) {
      if (erro) {
        return reject(erro);
      }

      return resolve(this.changes);
    });
  });
}

function deletarChamadoComFiltros({
  chamadoId,
  statusAtual,
  usuarioId,
  limitarPorUsuario,
}) {
  return new Promise((resolve, reject) => {
    let query = "DELETE FROM chamados WHERE id = ? AND status = ?";
    const valores = [chamadoId, statusAtual];

    if (limitarPorUsuario) {
      query += " AND usuario_id = ?";
      valores.push(usuarioId);
    }

    db.run(query, valores, function onDelete(erro) {
      if (erro) {
        return reject(erro);
      }

      return resolve(this.changes);
    });
  });
}

module.exports = {
  buscarCategoriaPorNome,
  criarChamado,
  buscarChamadoPorId,
  buscarChamadoDetalhadoPorId,
  atualizarStatusChamado,
  registrarHistoricoStatus,
  listarRelatorioChamados,
  contarChamadosPorStatus,
  calcularTempoMedioConclusao,
  buscarCategoriaMaisRecorrente,
  atualizarChamadoComFiltros,
  deletarChamadoComFiltros,
};
