const chamadoRepository = require("../repositories/chamadoRepository");
const viaCepService = require("./viaCepService");

const PRIORIDADES_VALIDAS = ["BAIXA", "MEDIA", "ALTA"];

function normalizarCategoria(categoria) {
  return categoria.trim().toUpperCase().replace(/\s+/g, "_");
}

function normalizarCep(cep) {
  return String(cep).replace(/\D/g, "");
}

async function abrirChamado({ usuarioId, categoria, descricao, cep, prioridade, status }) {
  const categoriaNormalizada = normalizarCategoria(categoria);
  const cepNormalizado = normalizarCep(cep);
  const prioridadeNormalizada = prioridade.toUpperCase();
  const statusFinal = status ? status.toUpperCase() : "ABERTO";

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

module.exports = {
  abrirChamado,
};
