# Plano inicial de implementação

Cada task deve ser pequena, revisável e terminar com testes proporcionais. Não começar a próxima fase deixando migrations, lint ou testes quebrados.

## Fase 0 — Fundação

### Task 01 — Estrutura do repositório

- criar `backend/`, manter `frontend/` reservado e incluir `docs/`;
- iniciar NestJS com npm e TypeScript strict;
- configurar ESLint, Prettier e scripts básicos;
- adicionar `.gitignore`, `.env.example` e README de execução.

**Pronto quando:** aplicação inicia e lint/test/build passam.

### Task 02 — PostgreSQL local

- criar `docker-compose.yml` somente para PostgreSQL;
- adicionar volume, healthcheck e variáveis locais;
- documentar comandos de subir/parar sem apagar dados.

**Pronto quando:** PostgreSQL fica saudável e aceita conexão local.

### Task 03 — Prisma e configuração

- instalar/configurar Prisma e `ConfigModule`;
- validar variáveis no startup;
- criar `PrismaModule`/`PrismaService`;
- preparar bancos separados de development e test.

**Pronto quando:** API conecta ao banco e um teste de integração simples passa.

## Fase 1 — Modelo e contas

### Task 04 — Schema base e primeira migration

- implementar `Usuario`, `Cliente`, `Barbeiro` e `RecuperacaoSenha`;
- usar domínio em português, e-mail único e constraints;
- gerar/revisar migration.

**Pronto quando:** migration sobe do zero e constraints são testadas.

### Task 05 — Seed seguro

- criar Administrador inicial por variáveis de ambiente;
- usar Argon2;
- tornar seed repetível sem duplicar dados.

### Task 06 — Cadastro de Cliente

- DTO, Controller, Service e Repository;
- normalizar e-mail;
- transação `Usuario + Cliente`;
- bairro obrigatório e `409` para e-mail duplicado;
- e-mail de boas-vindas com fake inicial e falha não bloqueante.

### Task 07 — Login e JWT

- endpoint único;
- Argon2, access token, strategy e `JwtAuthGuard`;
- payload mínimo;
- bloqueio de Usuário inativo.

### Task 08 — Roles e recursos próprios

- decorator `@Roles` e `RolesGuard`;
- helpers para usuário autenticado;
- primeiro endpoint `/clientes/me` provando isolamento.

### Task 09 — Criação e primeiro acesso do Barbeiro

- criação apenas por Administrador;
- senha temporária, `primeiro_acesso = true`;
- troca obrigatória e restrição das demais rotas;
- testes de autorização.

### Task 10 — Recuperação de senha

- token aleatório, hash, expiração e uso único;
- resposta neutra;
- e-mail via interface/fake;
- fluxo válido para os três perfis.

## Fase 2 — Catálogo e agenda

### Task 11 — Serviços

- modelos `Servico` e `BarbeiroServico`;
- duração fixa em 30 e descrição opcional;
- CRUD administrativo com ativação/desativação;
- seed dos três Serviços básicos.

### Task 12 — Funcionamento e disponibilidade

- modelos e endpoints de `HorarioFuncionamento` e `DisponibilidadeBarbeiro`;
- Administrador define funcionamento;
- Barbeiro edita apenas a própria disponibilidade;
- validação de limites e sobreposição.

### Task 13 — Bloqueios e slots

- modelo `BloqueioAgenda`;
- bloqueio parcial/dia inteiro;
- cálculo de slots de 30 minutos sem persistir slots;
- endpoint de horários disponíveis.

## Fase 3 — Agendamentos

### Task 14 — Criar Agendamento

- modelo/migration e estados;
- janela de 1h30 a 7 dias;
- habilitação, disponibilidade e repetição diária;
- índice de proteção concorrente;
- testes unitários e integração de corrida/conflito.

### Task 15 — Consultar, cancelar e marcar falta

- consultas por perfil;
- regras diferentes para Cliente, Barbeiro e Administrador;
- auditoria de quem cancelou;
- marcação de falta autorizada.

### Task 16 — Reagendar

- atualizar o mesmo registro;
- aplicar novamente todas as validações;
- operação transacional e conflito `409`.

## Fase 4 — Planos e assinaturas

### Task 17 — Planos e cobertura

- `Plano` e `PlanoServico`;
- seed de R$ 100 e R$ 110;
- cobertura e repasse fixo;
- desconto configurável sem inventar percentual.

### Task 18 — Assinatura e pagamento manual

- uma vigente por Cliente;
- status e período;
- Pagamento registrado por Administrador;
- renovação transacional;
- cancelamento até fim da vigência.

## Fase 5 — Atendimentos

### Task 19 — Atendimento agendado e avulso

- modelos `Atendimento` e `AtendimentoExtra`;
- permitir Cliente nulo no avulso;
- Serviço realizado diferente do agendado;
- conclusão sem `EM_ANDAMENTO`.

### Task 20 — Cálculos financeiros

- cobertura, desconto, comissão 50%, repasse e gorjeta;
- formas de pagamento e totais;
- snapshots de valores;
- suíte unitária com `Decimal`.

### Task 21 — Correção auditada

- `CorrecaoAtendimento` com JSON antes/depois;
- somente Administrador, motivo obrigatório;
- atualização e auditoria na mesma transação.

## Fase 6 — Consultas, qualidade e entrega

### Task 22 — Dashboard do Barbeiro

- período;
- somente dados próprios;
- atendimentos, serviços, comissão, repasse, gorjeta e rendimento.

### Task 23 — Dashboard administrativo

- faturamento sem gorjeta;
- atendimentos, assinantes, ticket médio, serviços, bairros, faltas/cancelamentos e dados por Barbeiro;
- testes das fórmulas.

### Task 24 — Swagger e erros

- documentar DTOs, autenticação, exemplos e respostas;
- filter global de erros sanitizados;
- revisar mensagens e status.

### Task 25 — E2E e endurecimento

- executar os quatro fluxos E2E definidos;
- revisar CORS, logs, segredos e rate limiting básico;
- comprovar migrations do zero em banco limpo;
- revisar documentação e remover divergências.

## Regra de execução

Para cada task:

1. ler `AGENTS.md` e os documentos afetados;
2. declarar a menor alteração necessária;
3. implementar sem antecipar tasks futuras;
4. adicionar/ajustar testes relevantes;
5. executar lint, testes e build adequados;
6. revisar migration e diff;
7. atualizar documentação se a decisão mudou.

Se uma decisão de negócio necessária não estiver documentada — por exemplo, o percentual exato de desconto ou o valor de um repasse — não inventar. Deixar configurável quando já definido assim ou pedir decisão antes de persistir um padrão de negócio.
