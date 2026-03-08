const chamadoService = require("../services/chamadoService");

async function abrirChamado(req, res) {
  try {
    const { categoria, descricao, cep, prioridade, status } = req.body;

    if (!categoria || !descricao || !cep || !prioridade) {
      return res.status(400).json({
        erro: "Categoria, descricao, CEP e prioridade sao obrigatorios",
      });
    }

    const resultado = await chamadoService.abrirChamado({
      usuarioId: req.user.id,
      categoria,
      descricao,
      cep,
      prioridade,
      status,
    });

    if (resultado.erro) {
      return res.status(resultado.status).json({ erro: resultado.mensagem });
    }

    return res.status(201).json({
      mensagem: "Chamado aberto com sucesso",
      chamado: resultado.chamado,
    });
  } catch (erro) {
    console.log(`Erro ao abrir chamado: ${erro.message}`);

    if (
      erro.message.includes("no such table: chamados") ||
      erro.message.includes("no such table: categorias")
    ) {
      return res.status(500).json({
        erro: "Banco nao inicializado. Execute o script sql/init.sql",
      });
    }

    return res.status(500).json({ erro: "Erro interno ao abrir chamado" });
  }
}

async function atualizarStatus(req, res) {
  try {
    const { id } = req.params;
    const { status, observacao } = req.body;

    if (!status) {
      return res.status(400).json({
        erro: "Status e obrigatorio",
      });
    }

    const resultado = await chamadoService.atualizarStatusChamado({
      chamadoId: Number(id),
      novoStatus: status,
      mudadoPorUsuarioId: req.user.id,
      observacao,
    });

    if (resultado.erro) {
      return res.status(resultado.status).json({ erro: resultado.mensagem });
    }

    return res.json({
      mensagem: "Status atualizado com sucesso",
      chamado: resultado.chamado,
    });
  } catch (erro) {
    console.log(`Erro ao atualizar status: ${erro.message}`);

    if (
      erro.message.includes("no such table: chamados") ||
      erro.message.includes("no such table: historico_status")
    ) {
      return res.status(500).json({
        erro: "Banco nao inicializado. Execute o script sql/init.sql",
      });
    }

    return res.status(500).json({ erro: "Erro interno ao atualizar status" });
  }
}

async function relatorio(req, res) {
  try {
    const { dataInicio, dataFim, status, categoria } = req.query;

    const resultado = await chamadoService.gerarRelatorioChamados({
      dataInicio,
      dataFim,
      status,
      categoria,
    });

    if (resultado.erro) {
      return res.status(resultado.status).json({ erro: resultado.mensagem });
    }

    return res.json({
      total: resultado.dados.length,
      dados: resultado.dados,
    });
  } catch (erro) {
    console.log(`Erro ao gerar relatorio: ${erro.message}`);
    return res.status(500).json({ erro: "Erro interno ao gerar relatorio" });
  }
}

async function indicadores(req, res) {
  try {
    const dados = await chamadoService.obterIndicadores();
    return res.json(dados);
  } catch (erro) {
    console.log(`Erro ao gerar indicadores: ${erro.message}`);
    return res.status(500).json({ erro: "Erro interno ao gerar indicadores" });
  }
}

async function atualizarChamado(req, res) {
  try {
    const { id } = req.params;
    const { descricao, prioridade, categoria, statusAtual } = req.body;

    if (!descricao && !prioridade && !categoria) {
      return res.status(400).json({
        erro: "Informe ao menos um campo para atualizacao",
      });
    }

    const resultado = await chamadoService.atualizarChamado({
      chamadoId: Number(id),
      usuario: req.user,
      descricao,
      prioridade,
      categoria,
      statusAtual,
    });

    if (resultado.erro) {
      return res.status(resultado.status).json({ erro: resultado.mensagem });
    }

    return res.json({
      mensagem: "Chamado atualizado com sucesso",
      chamado: resultado.chamado,
    });
  } catch (erro) {
    console.log(`Erro ao atualizar chamado: ${erro.message}`);
    return res.status(500).json({ erro: "Erro interno ao atualizar chamado" });
  }
}

async function removerChamado(req, res) {
  try {
    const { id } = req.params;
    const { statusAtual } = req.query;

    const resultado = await chamadoService.deletarChamado({
      chamadoId: Number(id),
      usuario: req.user,
      statusAtual,
    });

    if (resultado.erro) {
      return res.status(resultado.status).json({ erro: resultado.mensagem });
    }

    return res.json({ mensagem: "Chamado removido com sucesso" });
  } catch (erro) {
    console.log(`Erro ao remover chamado: ${erro.message}`);
    return res.status(500).json({ erro: "Erro interno ao remover chamado" });
  }
}

module.exports = {
  abrirChamado,
  atualizarStatus,
  relatorio,
  indicadores,
  atualizarChamado,
  removerChamado,
};
