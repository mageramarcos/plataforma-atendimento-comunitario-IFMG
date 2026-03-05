const sqlite3 = require("sqlite3").verbose();
const path = require("path");

class DatabaseConnection {
  constructor() {
    if (DatabaseConnection.instancia) {
      return DatabaseConnection.instancia;
    }

    const caminhoBanco = path.resolve(__dirname, "../../sql/plataforma.db");
    this.db = new sqlite3.Database(caminhoBanco, (erro) => {
      if (erro) {
        console.log("Erro ao conectar no SQLite", erro.message);
        return;
      }

      console.log("Banco SQLite conectado com sucesso");
    });

    DatabaseConnection.instancia = this;
  }

  static getInstance() {
    if (!DatabaseConnection.instancia) {
      DatabaseConnection.instancia = new DatabaseConnection();
    }

    return DatabaseConnection.instancia;
  }
}

function conectarBanco() {
  return DatabaseConnection.getInstance().db;
}

module.exports = {
  conectarBanco,
  DatabaseConnection,
};
