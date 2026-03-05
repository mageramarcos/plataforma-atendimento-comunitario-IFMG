const express = require("express");
const router = require("./routes");
const { logMiddleware } = require("./middlewares/logMiddleware");

const app = express();

app.use(express.json());
app.use(logMiddleware);
app.use(router);

app.use((req, res) => {
  return res.status(404).json({ erro: "PAGE NOT FOUND / ROTA NAO ENCONTRADA" });
});

module.exports = app;
