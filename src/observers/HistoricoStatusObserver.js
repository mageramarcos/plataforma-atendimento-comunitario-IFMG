class HistoricoStatusObserver {
  constructor(chamadoRepository) {
    this.chamadoRepository = chamadoRepository;
  }

  async atualizar(evento) {
    await this.chamadoRepository.registrarHistoricoStatus({
      chamadoId: evento.chamadoId,
      statusAnterior: evento.statusAnterior,
      statusNovo: evento.statusNovo,
      mudadoPorUsuarioId: evento.mudadoPorUsuarioId,
      observacao: evento.observacao,
    });
  }
}

module.exports = HistoricoStatusObserver;
