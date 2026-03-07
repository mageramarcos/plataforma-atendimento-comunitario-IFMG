async function buscarEnderecoPorCep(cep) {
  const url = `https://viacep.com.br/ws/${cep}/json/`;

  const resposta = await fetch(url);

  if (!resposta.ok) {
    throw new Error("Falha ao consultar ViaCEP");
  }

  const dados = await resposta.json();

  if (dados.erro) {
    return null;
  }

  return {
    cidade: dados.localidade,
    uf: dados.uf,
  };
}

module.exports = {
  buscarEnderecoPorCep,
};
