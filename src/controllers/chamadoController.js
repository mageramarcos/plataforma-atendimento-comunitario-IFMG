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

module.exports = {
  abrirChamado,
};
