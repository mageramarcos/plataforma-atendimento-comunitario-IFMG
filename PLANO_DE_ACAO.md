# Plano de Acao - Plataforma de Atendimento Comunitario

Projeto base seguindo o padrao de camadas trabalhado na pasta `aula39`:
- controllers
- services
- repositories
- middlewares
- routes
- models

Banco de dados escolhido: **SQLite** (mesmo padrao utilizado nas aulas).

## Roadmap de commits semanticos

1. `chore: inicializa projeto express e estrutura em camadas`
2. `chore: adiciona script SQL com tabelas e relacionamentos PK/FK`
3. `feat: implementa cadastro e login com senha hash e JWT`
4. `feat: cria middleware de autenticacao e autorizacao de rotas privadas`
5. `feat: implementa abertura de chamados com validacao e integracao ViaCEP`
6. `feat: aplica factory para criacao de chamados por categoria`
7. `feat: implementa fluxo de status com observer e historico_status`
8. `feat: adiciona endpoints de relatorios com filtros e consulta JOIN`
9. `feat: adiciona endpoint de indicadores (status, media conclusao, categoria recorrente)`
10. `feat: implementa update e delete com filtros seguros`
11. `chore: adiciona middleware de log (data, metodo, rota e status)`
12. `docs: cria README, variaveis de ambiente e colecao de testes`

## Divisao sugerida por dia

Dia 1:
- commits 1, 2, 3 e 4

Dia 2:
- commits 5, 6 e 7

Dia 3:
- commits 8, 9, 10, 11 e 12

## Fluxo de branch para atender o requisito

1. Criar branch por feature (exemplo: `feature/auth`).
2. Desenvolver e commitar incrementalmente na branch.
3. Realizar merge para `main` ao concluir a feature.
4. Repetir o fluxo para a proxima feature.
