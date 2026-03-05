require("dotenv").config();

const app = require("./app");
const { conectarBanco } = require("./database/connection");

const PORT = process.env.PORT || 3000;

conectarBanco();

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
