function logMiddleware(req, res, next) {
  const inicio = Date.now();

  res.on("finish", () => {
    const duracaoMs = Date.now() - inicio;
    const dataHora = new Date().toISOString();
    console.log(
      `[${dataHora}] ${req.method} ${req.originalUrl} ${res.statusCode} ${duracaoMs}ms`,
    );
  });

  return next();
}

module.exports = {
  logMiddleware,
};
