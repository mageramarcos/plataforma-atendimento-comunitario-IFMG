const express = require("express");
const healthController = require("../controllers/healthController");
const authController = require("../controllers/authController");

const router = express.Router();

router.get("/health", healthController.health);
router.post("/auth/cadastro", authController.cadastro);
router.post("/auth/login", authController.login);

module.exports = router;
