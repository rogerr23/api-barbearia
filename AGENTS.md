# AGENTS.md — api-barbearia

Este arquivo orienta agentes que trabalham neste repositório. Leia também `docs/README.md` e o documento do domínio alterado antes de editar código.

## Objetivo e escopo

- Construir a V1 da API de gestão de uma única barbearia.
- Backend em `backend/`; frontend futuro em `frontend/`.
- Stack: TypeScript, NestJS, PostgreSQL e Prisma.
- Arquitetura: monólito modular REST, organizado por domínio.
- Desenvolvimento: NestJS local e PostgreSQL no Docker.

## Fonte de verdade

Os arquivos em `docs/` são normativos. Em conflito com conversa antiga, comentário ou código incompleto, prevalecem as decisões finais dos documentos. Não altere uma regra de negócio silenciosamente; atualize documentação e testes junto da mudança.

Decisões que nunca devem regredir:

- Assinatura Completa custa R$ 110,00, não R$ 115,00.
- Todo Serviço dura exatamente 30 minutos, inclusive Corte + Barba.
- Slots têm 30 minutos; não implementar duração variável ou múltiplos slots.
- Recuperação de senha está adiada para depois da V1.
- Não existe status `EM_ANDAMENTO`.
- A V1 não envia e-mail, WhatsApp ou outras mensagens externas; o frontend usa a resposta da API para feedback imediato.
- Domínio, código e endpoints são em português; termos técnicos consolidados podem ficar em inglês.

## Regras centrais

- Perfis: `CLIENTE`, `BARBEIRO`, `ADMINISTRADOR`.
- E-mail é normalizado e globalmente único.
- Bairro do Cliente é obrigatório; não coletar CEP/endereço na V1.
- Cliente cria a própria conta; Administrador cria Barbeiro com senha temporária; Administrador inicial vem de seed.
- Barbeiro troca senha no primeiro login e fica restrito até concluir a troca.
- JWT + Argon2 + `JwtAuthGuard` + `RolesGuard`; somente access token na V1.
- Autorização exige role e validação de propriedade no Service.
- Cliente agenda entre 1h30 e 7 dias; cancela até 2h antes.
- Barbeiro cancela apenas Agendamentos próprios; Administrador cancela qualquer um.
- Cliente não mantém o mesmo Serviço duas vezes no mesmo dia, mas pode manter Serviços diferentes.
- Somente o Barbeiro edita a própria disponibilidade; Administrador define funcionamento e visualiza.
- Atendimento pode ser avulso e sem Cliente cadastrado; Serviço realizado pode diferir do agendado.
- Comissão padrão de Serviço pago é 50% sobre o valor efetivamente cobrado.
- Serviço coberto por Assinatura usa repasse fixo, nunca comissão simultânea.
- Gorjeta pertence integralmente ao Barbeiro e não entra no faturamento.
- Plano Corte: R$ 100, Corte ilimitado e desconto em Serviços não cobertos.
- Plano Completo: R$ 110, Corte, Barba e Corte + Barba ilimitados e desconto nos demais.
- Pagamento de Assinatura é manual; cancelamento preserva benefícios até o fim da vigência.

## Organização e código

Fluxo padrão: `Controller → Service → Repository → Prisma → PostgreSQL`.

- Controller trata HTTP, sem regra de negócio.
- DTO valida formato, sem consultar banco.
- Service aplica regras, propriedade do recurso e coordena transações.
- Repository concentra acesso específico aos dados.
- Não acessar Prisma diretamente em Controllers.
- Não criar `GenericRepository`, `BaseService`, microserviços ou abstrações preventivas.
- Pastas e nomes de domínio em português: `clientes`, `AgendamentosService`, `CriarClienteDto`, `clienteId`.
- Manter termos técnicos usuais: Controller, Service, Repository, DTO, Guard, JWT, Prisma.
- Arquivos em `kebab-case`; classes em `PascalCase`; membros em `camelCase`.
- Não introduzir biblioteca ou padrão novo sem explicar o problema concreto resolvido.

## Banco e dinheiro

- IDs `Int` autoincrementais.
- Dinheiro e percentuais usam `Decimal/Numeric`, nunca ponto flutuante para cálculo.
- Toda alteração de schema usa Prisma Migrate e migration revisada.
- Use constraints/índices para integridade concorrente; traduza conflitos esperados para `409`.
- Use transações para agregados e operações descritas em `docs/06-persistencia-prisma.md`.
- Não executar reset, apagar migration ou volume como atalho.
- Preserve registros históricos e snapshots financeiros.

## API, segurança e privacidade

- Use status HTTP sem envelope global artificial.
- Mensagens de negócio são claras e em português.
- Nunca exponha stack trace, SQL ou detalhe do provedor.
- Nunca registre senha, hash de senha, JWT ou segredo.
- Use `/me` para recursos próprios e derive identidade do JWT.
- E-mail serve apenas como identificador de cadastro e login; não há envio de mensagens na V1.
- Não expor endpoints de recuperação de senha na V1.
- CORS é explícito por ambiente; segredos ficam fora do Git.

## Testes e conclusão de uma task

- Ferramentas: Jest e Supertest.
- Priorize testes unitários de regras; use integração para Prisma/constraints e poucos E2E críticos.
- Não crie testes triviais apenas para cobertura.
- Bug corrigido deve ganhar teste de regressão quando possível.
- Controle o relógio em regras de antecedência e vigência.
- Nunca use o banco de development em testes.

Antes de concluir uma task:

1. execute lint e formatação;
2. execute testes unitários afetados;
3. execute integração/E2E quando tocar persistência, auth ou fluxo HTTP;
4. execute build/typecheck;
5. revise migrations e confirme que sobem em banco limpo quando aplicável;
6. confira se documentação e OpenAPI continuam corretas;
7. relate verificações executadas e qualquer limitação real.

## Limites de autonomia

- Não invente percentuais de desconto, valores de repasse ou horários de funcionamento.
- Não amplie a V1 com notificações, filas, refresh token, gateway de pagamento, microserviços ou frontend.
- Se faltar decisão que muda comportamento financeiro, segurança ou dados persistidos, pare e peça a decisão.
- Prefira a menor mudança completa para a task atual; não implemente fases futuras por antecipação.
