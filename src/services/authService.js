const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userRepository = require("../repositories/userRepository");

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error("FATAL ERROR: JWT_SECRET nao encontrado no ambiente!");
  process.exit(1);
}

function gerarToken(usuario) {
  const payload = {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    role: usuario.role,
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });
}

async function cadastrar({ nome, email, senha, role = "cidadao" }) {
  const usuarioExistente = await userRepository.buscarUsuarioPorEmail(email);

  if (usuarioExistente) {
    return {
      erro: true,
      status: 409,
      mensagem: "Email ja cadastrado",
    };
  }

  const senhaHash = await bcrypt.hash(senha, 10);

  const usuarioCriado = await userRepository.criarUsuario({
    nome,
    email,
    senhaHash,
    role,
  });

  return {
    erro: false,
    usuario: usuarioCriado,
  };
}

async function login(email, senha) {
  const usuario = await userRepository.buscarUsuarioPorEmail(email);

  if (!usuario) {
    return null;
  }

  const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);

  if (!senhaValida) {
    return null;
  }

  const token = gerarToken(usuario);

  return {
    usuario: {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      role: usuario.role,
    },
    token,
  };
}

module.exports = {
  cadastrar,
  login,
  JWT_SECRET,
};
