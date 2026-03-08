class StatusSubject {
  constructor() {
    this.observadores = [];
  }

  addObserver(observador) {
    this.observadores.push(observador);
  }

  async notificar(evento) {
    for (const observador of this.observadores) {
      await observador.atualizar(evento);
    }
  }
}

module.exports = StatusSubject;
