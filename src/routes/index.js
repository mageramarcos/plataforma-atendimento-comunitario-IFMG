const express = require("express");
const healthController = require("../controllers/healthController");
const authController = require("../controllers/authController");
const apiController = require("../controllers/apiController");
const { authMiddleware } = require("../middlewares/authMiddleware");
const { authorizeRoles } = require("../middlewares/authorizationMiddleware");

const router = express.Router();

router.get("/health", healthController.health);
router.post("/auth/cadastro", authController.cadastro);
router.post("/auth/login", authController.login);
router.get("/perfil", authMiddleware, apiController.perfil);
router.get(
	"/painel-atendimento",
	authMiddleware,
	authorizeRoles("admin", "atendente"),
	apiController.painelAtendimento,
);

module.exports = router;
