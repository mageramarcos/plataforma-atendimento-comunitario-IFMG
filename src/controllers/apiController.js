function perfil(req, res) {
  return res.json({
    mensagem: "Rota perfil acessada com sucesso",
    usuario: req.user,
  });
}

function painelAtendimento(req, res) {
  return res.json({
    mensagem: `Acesso liberado para ${req.user.nome}`,
    dados: {
      setor: "Central Comunitaria",
      permissoes: req.user.role,
    },
  });
}

module.exports = {
  perfil,
  painelAtendimento,
};
