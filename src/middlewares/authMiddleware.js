const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../services/authService");

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ erro: "Token nao enviado" });
  }

  const [scheme, token] = authHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ erro: "Formato de token invalido" });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    return next();
  } catch (erro) {
    return res.status(403).json({ erro: "Token invalido ou expirado" });
  }
}

module.exports = {
  authMiddleware,
};
