# Plataforma de Atendimento Comunitario - IFMG

Backend da atividade final integradora utilizando Node.js, Express, SQLite e JWT.

## Requisitos

- Node.js 18+
- npm
- sqlite3 CLI

## Instalacao

```bash
npm install
```

## Variaveis de ambiente

Crie o arquivo `.env` com base no `.env.example`:

```env
PORT=3000
JWT_SECRET=seu_token_secreto_aqui
```

## Banco de dados (SQLite)

Inicialize o banco com o script SQL:

```bash
sqlite3 sql/plataforma.db < sql/init.sql
```

Este script cria as tabelas:
- `usuarios`
- `categorias`
- `chamados`
- `historico_status`

e tambem adiciona seed inicial.

## Executar projeto

```bash
npm start
```

API em: `http://localhost:3000`

## Usuarios seed para login

- Admin:
  - email: `marcos@ifmg.com`
  - senha: `123456`
- Atendente:
  - email: `ana@ifmg.com`
  - senha: `123456`
- Cidadao:
  - email: `joao@ifmg.com`
  - senha: `123456`

## Endpoints principais

### Publicos

- `GET /health`
- `POST /auth/cadastro`
- `POST /auth/login`

### Privados

- `GET /perfil`
- `GET /painel-atendimento` (admin e atendente)
- `POST /chamados`
- `PATCH /chamados/:id`
- `DELETE /chamados/:id?statusAtual=...`
- `PATCH /chamados/:id/status` (admin e atendente)
- `GET /relatorios/chamados` (admin e atendente)
- `GET /indicadores/chamados` (admin e atendente)

## Regras de negocio implementadas

- Cadastro e login com senha hash (`bcryptjs`) e JWT.
- Abertura de chamado com categoria, descricao, CEP, prioridade e status.
- Integracao ViaCEP para preencher cidade e UF.
- Fluxo de status obrigatorio:
  - `ABERTO -> EM_ATENDIMENTO -> CONCLUIDO`
- Observer para registrar historico a cada mudanca de status.
- Relatorios com filtros por periodo/status/categoria e consulta com JOIN.
- Indicadores:
  - total por status
  - tempo medio de conclusao
  - categoria mais recorrente
- Update e delete com filtros seguros (`id` + `statusAtual`).

## Padroes aplicados

- Singleton: conexao com banco SQLite
- Factory: criacao de tipo de chamado
- Observer: registro de historico de status

## Colecao Postman

Arquivo para testes manuais:

- `postman/PlataformaAtendimentoComunitario.postman_collection.json`

Importe no Postman e execute as pastas na ordem sugerida:
1. `01 - Health`
2. `02 - Auth`
3. `03 - Chamados`
4. `04 - Relatorios e Indicadores`

## Observacoes

- O middleware de log ja registra data, metodo, rota e status de todas as requisicoes.
- Em caso de erro de tabela inexistente, rode novamente:

```bash
sqlite3 sql/plataforma.db < sql/init.sql
```
