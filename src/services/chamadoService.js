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

module.exports = {
  abrirChamado,
  atualizarStatusChamado,
};
