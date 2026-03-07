function authorizeRoles(...rolesPermitidas) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ erro: "Usuario nao autenticado" });
    }

    const roleAutorizada = rolesPermitidas.includes(req.user.role);

    if (!roleAutorizada) {
      return res
        .status(403)
        .json({ erro: "Role nao permitida para essa rota" });
    }

    return next();
  };
}

module.exports = {
  authorizeRoles,
};
