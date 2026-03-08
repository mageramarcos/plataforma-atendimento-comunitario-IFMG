class ChamadoFactory {
  static normalizarCategoria(categoria) {
    return categoria.trim().toUpperCase().replace(/\s+/g, "_");
  }

  static normalizarCep(cep) {
    return String(cep).replace(/\D/g, "");
  }

  static criar({ categoria, descricao, cep, prioridade, status }) {
    const categoriaNormalizada = ChamadoFactory.normalizarCategoria(categoria);
    const cepNormalizado = ChamadoFactory.normalizarCep(cep);
    const prioridadeNormalizada = prioridade.toUpperCase();
    const statusFinal = status ? status.toUpperCase() : "ABERTO";

    switch (categoriaNormalizada) {
      case "FALTA_ENERGIA":
        return {
          categoria: "FALTA_ENERGIA",
          descricao,
          cep: cepNormalizado,
          prioridade: prioridadeNormalizada,
          status: statusFinal,
        };
      case "VAZAMENTO":
        return {
          categoria: "VAZAMENTO",
          descricao,
          cep: cepNormalizado,
          prioridade: prioridadeNormalizada,
          status: statusFinal,
        };
      case "QUEDA_ARVORE":
        return {
          categoria: "QUEDA_ARVORE",
          descricao,
          cep: cepNormalizado,
          prioridade: prioridadeNormalizada,
          status: statusFinal,
        };
      default:
        throw new Error("Tipo de chamado invalido");
    }
  }
}

module.exports = ChamadoFactory;
