const chamadoRepository = require("../repositories/chamadoRepository");
const viaCepService = require("./viaCepService");
const ChamadoFactory = require("../models/ChamadoFactory");
const StatusSubject = require("../models/StatusSubject");
const HistoricoStatusObserver = require("../observers/HistoricoStatusObserver");

const PRIORIDADES_VALIDAS = ["BAIXA", "MEDIA", "ALTA"];
const FLUXO_STATUS = {
  ABERTO: "EM_ATENDIMENTO",
  EM_ATENDIMENTO: "CONCLUIDO",
};
const STATUS_VALIDOS = ["ABERTO", "EM_ATENDIMENTO", "CONCLUIDO"];

function normalizarData(data) {
  if (!data) {
    return null;
  }

  const formatoValido = /^\d{4}-\d{2}-\d{2}$/.test(data);
  return formatoValido ? data : null;
}

async function abrirChamado({
  usuarioId,
  categoria,
  descricao,
  cep,
  prioridade,
  status,
}) {
  let chamadoCriadoPelaFactory;

  try {
    chamadoCriadoPelaFactory = ChamadoFactory.criar({
      categoria,
      descricao,
      cep,
      prioridade,
      status,
    });
  } catch (erro) {
    return {
      erro: true,
      status: 400,
      mensagem: "Tipo de chamado invalido",
    };
  }

  const { categoria: categoriaNormalizada, cep: cepNormalizado } =
    chamadoCriadoPelaFactory;
  const prioridadeNormalizada = chamadoCriadoPelaFactory.prioridade;
  const statusFinal = chamadoCriadoPelaFactory.status;

  if (cepNormalizado.length !== 8) {
    return {
      erro: true,
      status: 400,
      mensagem: "CEP invalido. Informe 8 digitos",
    };
  }

  if (!PRIORIDADES_VALIDAS.includes(prioridadeNormalizada)) {
    return {
      erro: true,
      status: 400,
      mensagem: "Prioridade invalida. Use BAIXA, MEDIA ou ALTA",
    };
  }

  if (statusFinal !== "ABERTO") {
    return {
      erro: true,
      status: 400,
      mensagem: "Status inicial do chamado deve ser ABERTO",
    };
  }

  const categoriaEncontrada =
    await chamadoRepository.buscarCategoriaPorNome(categoriaNormalizada);

  if (!categoriaEncontrada) {
    return {
      erro: true,
      status: 404,
      mensagem: "Categoria nao encontrada",
    };
  }

  let endereco;

  try {
    endereco = await viaCepService.buscarEnderecoPorCep(cepNormalizado);
  } catch (erro) {
    return {
      erro: true,
      status: 502,
      mensagem: "Erro ao consultar API de CEP",
    };
  }

  if (!endereco) {
    return {
      erro: true,
      status: 400,
      mensagem: "CEP nao encontrado",
    };
  }

  const chamado = await chamadoRepository.criarChamado({
    usuarioId,
    categoriaId: categoriaEncontrada.id,
    descricao,
    cep: cepNormalizado,
    cidade: endereco.cidade,
    uf: endereco.uf,
    prioridade: prioridadeNormalizada,
    status: statusFinal,
  });

  return {
    erro: false,
    chamado: {
      ...chamado,
      categoria: categoriaEncontrada.nome,
    },
  };
}

async function atualizarStatusChamado({
  chamadoId,
  novoStatus,
  mudadoPorUsuarioId,
  observacao,
}) {
  const chamado = await chamadoRepository.buscarChamadoPorId(chamadoId);

  if (!chamado) {
    return {
      erro: true,
      status: 404,
      mensagem: "Chamado nao encontrado",
    };
  }

  const statusAtual = chamado.status;
  const statusNovoNormalizado = novoStatus.toUpperCase();
  const proximoStatusEsperado = FLUXO_STATUS[statusAtual];

  if (!proximoStatusEsperado || statusNovoNormalizado !== proximoStatusEsperado) {
    return {
      erro: true,
      status: 400,
      mensagem: `Fluxo invalido. Permitido: ${statusAtual} -> ${proximoStatusEsperado || "SEM_TRANSICAO"}`,
    };
  }

  await chamadoRepository.atualizarStatusChamado({
    chamadoId,
    novoStatus: statusNovoNormalizado,
  });

  const statusSubject = new StatusSubject();
  statusSubject.addObserver(new HistoricoStatusObserver(chamadoRepository));

  await statusSubject.notificar({
    chamadoId,
    statusAnterior: statusAtual,
    statusNovo: statusNovoNormalizado,
    mudadoPorUsuarioId,
    observacao: observacao || "Atualizacao de status",
  });

  return {
    erro: false,
    chamado: {
      id: chamadoId,
      statusAnterior: statusAtual,
      statusAtual: statusNovoNormalizado,
    },
  };
}

async function gerarRelatorioChamados({ dataInicio, dataFim, status, categoria }) {
  const inicioNormalizado = normalizarData(dataInicio);
  const fimNormalizado = normalizarData(dataFim);
  const statusNormalizado = status ? status.toUpperCase() : null;
  const categoriaNormalizada = categoria
    ? categoria.trim().toUpperCase().replace(/\s+/g, "_")
    : null;

  if (dataInicio && !inicioNormalizado) {
    return {
      erro: true,
      status: 400,
      mensagem: "dataInicio invalida. Use YYYY-MM-DD",
    };
  }

  if (dataFim && !fimNormalizado) {
    return {
      erro: true,
      status: 400,
      mensagem: "dataFim invalida. Use YYYY-MM-DD",
    };
  }

  if (statusNormalizado && !STATUS_VALIDOS.includes(statusNormalizado)) {
    return {
      erro: true,
      status: 400,
      mensagem: "Status invalido",
    };
  }

  const dados = await chamadoRepository.listarRelatorioChamados({
    dataInicio: inicioNormalizado,
    dataFim: fimNormalizado,
    status: statusNormalizado,
    categoria: categoriaNormalizada,
  });

  return {
    erro: false,
    dados,
  };
}

async function obterIndicadores() {
  const totais = await chamadoRepository.contarChamadosPorStatus();
  const mediaConclusao = await chamadoRepository.calcularTempoMedioConclusao();
  const categoriaRecorrente = await chamadoRepository.buscarCategoriaMaisRecorrente();

  return {
    totalPorStatus: totais,
    tempoMedioConclusaoHoras: mediaConclusao.media_horas
      ? Number(mediaConclusao.media_horas.toFixed(2))
      : 0,
    categoriaMaisRecorrente: categoriaRecorrente || {
      categoria: null,
      total: 0,
    },
  };
}

async function atualizarChamado({
  chamadoId,
  usuario,
  descricao,
  prioridade,
  categoria,
  statusAtual,
}) {
  const chamado = await chamadoRepository.buscarChamadoDetalhadoPorId(chamadoId);

  if (!chamado) {
    return {
      erro: true,
      status: 404,
      mensagem: "Chamado nao encontrado",
    };
  }

  if (!statusAtual) {
    return {
      erro: true,
      status: 400,
      mensagem: "statusAtual e obrigatorio para update seguro",
    };
  }

  const statusAtualNormalizado = statusAtual.toUpperCase();

  if (!STATUS_VALIDOS.includes(statusAtualNormalizado)) {
    return {
      erro: true,
      status: 400,
      mensagem: "statusAtual invalido",
    };
  }

  const limitarPorUsuario = usuario.role === "cidadao";

  if (limitarPorUsuario && chamado.usuario_id !== usuario.id) {
    return {
      erro: true,
      status: 403,
      mensagem: "Sem permissao para atualizar este chamado",
    };
  }

  let prioridadeNormalizada = null;
  if (prioridade) {
    prioridadeNormalizada = prioridade.toUpperCase();
    if (!PRIORIDADES_VALIDAS.includes(prioridadeNormalizada)) {
      return {
        erro: true,
        status: 400,
        mensagem: "Prioridade invalida. Use BAIXA, MEDIA ou ALTA",
      };
    }
  }

  let categoriaId = null;
  if (categoria) {
    const categoriaNormalizada = categoria.trim().toUpperCase().replace(/\s+/g, "_");
    const categoriaEncontrada = await chamadoRepository.buscarCategoriaPorNome(
      categoriaNormalizada,
    );

    if (!categoriaEncontrada) {
      return {
        erro: true,
        status: 404,
        mensagem: "Categoria nao encontrada",
      };
    }

    categoriaId = categoriaEncontrada.id;
  }

  const alterados = await chamadoRepository.atualizarChamadoComFiltros({
    chamadoId,
    descricao,
    prioridade: prioridadeNormalizada,
    categoriaId,
    statusAtual: statusAtualNormalizado,
    usuarioId: usuario.id,
    limitarPorUsuario,
  });

  if (alterados === 0) {
    return {
      erro: true,
      status: 409,
      mensagem: "Nenhum registro atualizado. Verifique filtros de id/statusAtual",
    };
  }

  const chamadoAtualizado = await chamadoRepository.buscarChamadoDetalhadoPorId(chamadoId);

  return {
    erro: false,
    chamado: chamadoAtualizado,
  };
}

async function deletarChamado({ chamadoId, usuario, statusAtual }) {
  const chamado = await chamadoRepository.buscarChamadoDetalhadoPorId(chamadoId);

  if (!chamado) {
    return {
      erro: true,
      status: 404,
      mensagem: "Chamado nao encontrado",
    };
  }

  if (!statusAtual) {
    return {
      erro: true,
      status: 400,
      mensagem: "statusAtual e obrigatorio para delete seguro",
    };
  }

  const statusAtualNormalizado = statusAtual.toUpperCase();

  if (!STATUS_VALIDOS.includes(statusAtualNormalizado)) {
    return {
      erro: true,
      status: 400,
      mensagem: "statusAtual invalido",
    };
  }

  const limitarPorUsuario = usuario.role === "cidadao";

  if (limitarPorUsuario && chamado.usuario_id !== usuario.id) {
    return {
      erro: true,
      status: 403,
      mensagem: "Sem permissao para remover este chamado",
    };
  }

  const removidos = await chamadoRepository.deletarChamadoComFiltros({
    chamadoId,
    statusAtual: statusAtualNormalizado,
    usuarioId: usuario.id,
    limitarPorUsuario,
  });

  if (removidos === 0) {
    return {
      erro: true,
      status: 409,
      mensagem: "Nenhum registro removido. Verifique filtros de id/statusAtual",
    };
  }

  return {
    erro: false,
  };
}

module.exports = {
  abrirChamado,
  atualizarStatusChamado,
  gerarRelatorioChamados,
  obterIndicadores,
  atualizarChamado,
  deletarChamado,
};
