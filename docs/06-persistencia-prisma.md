# PostgreSQL, Prisma, migrations e transações

## 1. Diretrizes

- PostgreSQL é a fonte de verdade.
- O `schema.prisma` reflete o DER; conveniências do ORM não alteram o domínio.
- Toda mudança estrutural usa migration versionada.
- Nunca usar `db push` como mecanismo de evolução de produção.
- Nunca executar reset automático em banco compartilhado, de desenvolvimento do usuário ou produção.
- Seed deve ser idempotente sempre que prático e jamais conter segredos reais versionados.

## 2. Tipos físicos recomendados

| Conceito | Tipo |
|---|---|
| ID | `INTEGER` autoincremental |
| Dinheiro | `NUMERIC(12,2)` ou precisão equivalente documentada |
| Percentual | `NUMERIC(5,2)` |
| Data civil | `DATE` |
| Hora civil | `TIME` |
| Instante/auditoria | `TIMESTAMPTZ` |
| Snapshots de correção | `JSONB` |

Usar `Prisma.Decimal` ou biblioteca compatível do próprio Prisma nos cálculos e na serialização controlada. Não converter valores monetários para ponto flutuante durante cálculos.

## 3. Migrations e constraints

Cada migration deve ser pequena, revisável e compatível com dados existentes. Constraints mínimas:

- `UNIQUE` em e-mail normalizado;
- `UNIQUE` em `Cliente.usuario_id` e `Barbeiro.usuario_id`;
- `UNIQUE` em `Atendimento.agendamento_id` quando não nulo;
- PKs compostas em `BarbeiroServico` e `PlanoServico`;
- `CHECK` de valores monetários não negativos;
- `CHECK` de percentuais entre 0 e 100;
- `CHECK Servico.duracao_minutos = 30` na V1;
- `CHECK hora_inicio < hora_fim`;
- `CHECK` coerente para bloqueio de dia inteiro;
- FKs com política de exclusão restritiva para dados históricos.

Prisma Migrate permite editar o SQL gerado. Use SQL explícito quando a regra exigir índice parcial ou constraint que o schema não expresse diretamente.

## 4. Concorrência de Agendamento

Como todos os Serviços ocupam um slot de 30 minutos, a proteção de dupla reserva pode usar um índice único parcial equivalente a:

```sql
CREATE UNIQUE INDEX agendamento_barbeiro_slot_ativo_uq
ON "Agendamento" ("barbeiroId", "data", "horaInicio")
WHERE "status" = 'AGENDADO';
```

Também deve existir proteção para o mesmo Cliente/Serviço/dia enquanto o Agendamento não estiver cancelado, conforme a regra vigente. O Service faz validação amigável; a constraint resolve a corrida entre requisições. Violações esperadas viram `409 Conflict`.

Ao reagendar, validar e atualizar dentro de transação para que o próprio registro não conflite incorretamente e para não liberar/reservar slots pela metade.

## 5. Transações obrigatórias

Usar transações curtas nos casos:

1. criar `Usuario + Cliente`;
2. criar `Usuario + Barbeiro`;
3. concluir primeiro acesso: senha + flag;
4. redefinir senha: senha + consumo do token;
5. criar/reagendar Agendamento sob validação concorrente;
6. finalizar Atendimento: Atendimento + Extras + status do Agendamento;
7. corrigir Atendimento: alteração + `CorrecaoAtendimento`;
8. registrar `PagamentoAssinatura + período/status da Assinatura`;
9. contratar Assinatura garantindo somente uma vigente.

Não chamar provedor de e-mail dentro de transação de banco. O commit da regra de negócio ocorre primeiro; o e-mail é efeito externo posterior.

## 6. Índices

Adicionar índices guiados por consultas reais, começando por:

- `Usuario.email`;
- Agendamento por Barbeiro, data e status;
- Agendamento por Cliente e data;
- Atendimento por Barbeiro e data;
- Atendimento por Cliente e data;
- Assinatura por Cliente e status;
- Pagamento de Assinatura por data;
- FKs usadas em filtros e agregações.

Não adicionar índices indiscriminadamente. Validar consultas de Dashboard com `EXPLAIN` quando houver volume ou lentidão observável.

## 7. Seed

O seed inicial cria, no mínimo:

- Administrador inicial a partir de variáveis de ambiente seguras;
- Serviços `Corte`, `Barba` e `Corte + Barba`, todos com 30 minutos;
- Plano `Assinatura de Corte` por R$ 100,00;
- Plano `Assinatura Completa` por R$ 110,00;
- relações de cobertura dos Planos.

Descontos e valores de repasse devem ser configurados explicitamente; não inventar valores. Se não houver decisão, o seed exige configuração ou usa apenas dados que não alterem a regra financeira.

## 8. Bancos por ambiente

- `development`: banco local em PostgreSQL Docker.
- `test`: banco separado e descartável, nunca o de desenvolvimento.
- `production`: banco gerenciado/configurado externamente, com backup e credenciais próprias.

Testes devem falhar de forma segura se `DATABASE_URL` apontar para um banco que não esteja claramente identificado como teste.
