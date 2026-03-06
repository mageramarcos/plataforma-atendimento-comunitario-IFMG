const { conectarBanco } = require("../database/connection");

const db = conectarBanco();

function buscarUsuarioPorEmail(email) {
  return new Promise((resolve, reject) => {
    const query = "SELECT id, nome, email, senha_hash, role FROM usuarios WHERE email = ?";

    db.get(query, [email], (erro, row) => {
      if (erro) {
        return reject(erro);
      }

      return resolve(row || null);
    });
  });
}

function criarUsuario({ nome, email, senhaHash, role }) {
  return new Promise((resolve, reject) => {
    const query =
      "INSERT INTO usuarios (nome, email, senha_hash, role) VALUES (?, ?, ?, ?)";

    db.run(query, [nome, email, senhaHash, role], function onInsert(erro) {
      if (erro) {
        return reject(erro);
      }

      return resolve({
        id: this.lastID,
        nome,
        email,
        role,
      });
    });
  });
}

module.exports = {
  buscarUsuarioPorEmail,
  criarUsuario,
};
