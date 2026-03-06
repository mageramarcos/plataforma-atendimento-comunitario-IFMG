const authService = require("../services/authService");

const ROLES_VALIDAS = ["cidadao", "atendente", "admin"];

async function cadastro(req, res) {
  try {
    const { nome, email, senha, role } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({
        erro: "Nome, email e senha sao obrigatorios",
      });
    }

    if (role && !ROLES_VALIDAS.includes(role)) {
      return res.status(400).json({
        erro: "Role invalida",
      });
    }

    const resultado = await authService.cadastrar({ nome, email, senha, role });

    if (resultado.erro) {
      return res.status(resultado.status).json({ erro: resultado.mensagem });
    }

    return res.status(201).json({
      mensagem: "Usuario cadastrado com sucesso",
      usuario: resultado.usuario,
    });
  } catch (erro) {
    console.log(`Erro ao cadastrar usuario: ${erro.message}`);

    if (erro.message.includes("no such table: usuarios")) {
      return res.status(500).json({
        erro: "Banco nao inicializado. Execute o script sql/init.sql",
      });
    }

    return res.status(500).json({ erro: "Erro interno ao cadastrar usuario" });
  }
}

async function login(req, res) {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ erro: "Email e senha sao obrigatorios" });
    }

    const resultado = await authService.login(email, senha);

    if (!resultado) {
      return res.status(401).json({ erro: "Credenciais invalidas" });
    }

    return res.json({
      mensagem: "Login realizado com sucesso",
      token: resultado.token,
    });
  } catch (erro) {
    console.log(`Erro no login: ${erro.message}`);

    if (erro.message.includes("no such table: usuarios")) {
      return res.status(500).json({
        erro: "Banco nao inicializado. Execute o script sql/init.sql",
      });
    }

    return res.status(500).json({ erro: "Erro interno no login" });
  }
}

module.exports = {
  cadastro,
  login,
};
