function health(req, res) {
  return res.json({
    status: "UP",
    projeto: "plataforma-atendimento-comunitario-ifmg",
    timestamp: Date.now(),
  });
}

module.exports = {
  health,
};
