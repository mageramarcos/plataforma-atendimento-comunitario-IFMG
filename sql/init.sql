PRAGMA foreign_keys = ON;

DROP TABLE IF EXISTS historico_status;
DROP TABLE IF EXISTS chamados;
DROP TABLE IF EXISTS categorias;
DROP TABLE IF EXISTS usuarios;

CREATE TABLE usuarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  senha_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('cidadao', 'atendente', 'admin')),
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE categorias (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL UNIQUE,
  descricao TEXT
);

CREATE TABLE chamados (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario_id INTEGER NOT NULL,
  categoria_id INTEGER NOT NULL,
  descricao TEXT NOT NULL,
  cep TEXT NOT NULL,
  cidade TEXT,
  uf TEXT,
  prioridade TEXT NOT NULL CHECK (prioridade IN ('BAIXA', 'MEDIA', 'ALTA')),
  status TEXT NOT NULL CHECK (status IN ('ABERTO', 'EM_ATENDIMENTO', 'CONCLUIDO')) DEFAULT 'ABERTO',
  data_abertura DATETIME DEFAULT CURRENT_TIMESTAMP,
  data_conclusao DATETIME,
  FOREIGN KEY (usuario_id) REFERENCES usuarios (id),
  FOREIGN KEY (categoria_id) REFERENCES categorias (id)
);

CREATE TABLE historico_status (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  chamado_id INTEGER NOT NULL,
  status_anterior TEXT CHECK (status_anterior IN ('ABERTO', 'EM_ATENDIMENTO', 'CONCLUIDO')),
  status_novo TEXT NOT NULL CHECK (status_novo IN ('ABERTO', 'EM_ATENDIMENTO', 'CONCLUIDO')),
  mudado_por_usuario_id INTEGER,
  observacao TEXT,
  data_mudanca DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (chamado_id) REFERENCES chamados (id) ON DELETE CASCADE,
  FOREIGN KEY (mudado_por_usuario_id) REFERENCES usuarios (id)
);

CREATE INDEX idx_chamados_status ON chamados(status);
CREATE INDEX idx_chamados_categoria_id ON chamados(categoria_id);
CREATE INDEX idx_historico_chamado_id ON historico_status(chamado_id);

INSERT INTO usuarios (nome, email, senha_hash, role)
VALUES
  ('Marcos', 'marcos@ifmg.com', '$2a$10$.r2qO2HMfnHfuMqcurB1.esks3jH1aQIq91yFL3w2d6Wwqu3AKZX2', 'admin'),
  ('Ana', 'ana@ifmg.com', '$2a$10$.r2qO2HMfnHfuMqcurB1.esks3jH1aQIq91yFL3w2d6Wwqu3AKZX2', 'atendente'),
  ('Joao', 'joao@ifmg.com', '$2a$10$.r2qO2HMfnHfuMqcurB1.esks3jH1aQIq91yFL3w2d6Wwqu3AKZX2', 'cidadao');

INSERT INTO categorias (nome, descricao)
VALUES
  ('FALTA_ENERGIA', 'Ocorrencia de interrupcao no fornecimento de energia'),
  ('VAZAMENTO', 'Ocorrencia de vazamento de agua'),
  ('QUEDA_ARVORE', 'Ocorrencia de queda de arvore em via publica');

INSERT INTO chamados (
  usuario_id,
  categoria_id,
  descricao,
  cep,
  cidade,
  uf,
  prioridade,
  status,
  data_conclusao
)
VALUES
  (3, 1, 'Rua sem energia desde a madrugada', '35540000', 'Oliveira', 'MG', 'ALTA', 'ABERTO', NULL),
  (3, 2, 'Vazamento forte proximo ao mercado central', '35540000', 'Oliveira', 'MG', 'MEDIA', 'EM_ATENDIMENTO', NULL),
  (3, 3, 'Arvore caiu bloqueando a rua principal', '35540000', 'Oliveira', 'MG', 'ALTA', 'CONCLUIDO', CURRENT_TIMESTAMP);

INSERT INTO historico_status (
  chamado_id,
  status_anterior,
  status_novo,
  mudado_por_usuario_id,
  observacao
)
VALUES
  (1, NULL, 'ABERTO', 3, 'Chamado aberto pelo cidadao'),
  (2, NULL, 'ABERTO', 3, 'Chamado aberto pelo cidadao'),
  (2, 'ABERTO', 'EM_ATENDIMENTO', 2, 'Atendente assumiu atendimento'),
  (3, NULL, 'ABERTO', 3, 'Chamado aberto pelo cidadao'),
  (3, 'ABERTO', 'EM_ATENDIMENTO', 2, 'Equipe deslocada para atendimento'),
  (3, 'EM_ATENDIMENTO', 'CONCLUIDO', 2, 'Ocorrencia finalizada');

-- Exemplo de consulta com JOIN para uso nos relatorios
SELECT
  c.id AS chamado_id,
  c.status,
  c.prioridade,
  c.data_abertura,
  c.data_conclusao,
  cat.nome AS categoria,
  u.nome AS solicitante
FROM chamados c
INNER JOIN categorias cat ON cat.id = c.categoria_id
INNER JOIN usuarios u ON u.id = c.usuario_id;
