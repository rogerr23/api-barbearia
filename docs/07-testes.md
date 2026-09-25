# Estratégia de testes

## 1. Filosofia

Usar Jest e Supertest. Testar comportamentos e regras importantes, não existência trivial de classes. Não perseguir percentual de cobertura artificial na fase inicial.

Pirâmide:

```text
E2E          poucos fluxos principais
Integração   algumas operações críticas com PostgreSQL
Unitários    maioria das regras de negócio
```

## 2. Testes unitários prioritários

### Agendamento

- aceita slot válido de 30 minutos;
- rejeita menos de 1h30 de antecedência;
- rejeita mais de 7 dias;
- rejeita slot fora do funcionamento/disponibilidade;
- rejeita bloqueio parcial ou integral;
- rejeita Barbeiro sem habilitação para Serviço específico;
- rejeita horário ocupado;
- rejeita mesmo Serviço para o Cliente no mesmo dia;
- aceita Serviços diferentes no mesmo dia;
- permite cancelamento do Cliente até 2h antes e rejeita depois disso;
- permite Barbeiro cancelar somente Agendamento próprio;
- permite Administrador cancelar qualquer Agendamento;
- aplica as mesmas regras ao reagendamento.

### Atendimento e financeiro

- Serviço pago calcula 50% sobre o valor após desconto;
- Serviço coberto zera cobrança do Serviço e usa repasse, sem comissão;
- gorjeta pertence ao Barbeiro e não entra no faturamento;
- extras entram no total e na receita, sem comissão;
- Serviço realizado pode diferir do agendado;
- Atendimento avulso funciona com Cliente cadastrado ou sem conta;
- forma de pagamento é obrigatória somente quando total é maior que zero;
- correção gera snapshot e exige Administrador/motivo.

### Assinaturas

- impede duas Assinaturas vigentes;
- Plano Corte cobre Corte e dá desconto no restante;
- Plano Completo cobre os três Serviços básicos e dá desconto no restante;
- cancelamento mantém benefícios até o fim da vigência;
- pagamento manual renova período atomicamente.

### Auth e autorização

- e-mail é normalizado e duplicidade resulta em conflito;
- senha é verificada com Argon2;
- Barbeiro no primeiro acesso fica restrito até trocar senha;
- JWT contém somente `sub` e perfil necessários;
- cada perfil é bloqueado/permitido corretamente;
- propriedade do recurso é validada além da role;
- cadastro e demais mutações retornam status e mensagem adequados ao feedback imediato;
- endpoints de recuperação de senha não são expostos na V1.

## 3. Integração

Usar banco PostgreSQL de teste para validar Prisma, migrations e constraints. Casos mínimos:

- criar e buscar `Usuario + Cliente`;
- rejeitar e-mails iguais mesmo com diferença de maiúsculas/minúsculas;
- concorrência/constraint do slot do Barbeiro;
- somente uma Assinatura vigente;
- finalizar Atendimento com Extras em transação;
- registrar Pagamento e atualizar Assinatura;
- preservar histórico após alterar preço/comissão.

Cada teste isola seus dados. O setup aplica migrations; não aponta para o banco de desenvolvimento.

## 4. E2E essenciais

### Cliente

```text
cadastro → login → listar Serviços → consultar slots
→ agendar → reagendar → cancelar → consultar histórico
```

### Barbeiro

```text
Administrador cria conta → login temporário → troca senha
→ configura disponibilidade → consulta agenda
→ registra Atendimento → consulta Dashboard próprio
```

### Administrador e assinatura

```text
login → cria Barbeiro/Serviço → contrata Assinatura
→ registra Pagamento → registra Atendimento coberto
→ consulta Dashboard
```

## 5. Práticas

- Ao corrigir bug, criar primeiro um teste que o reproduza sempre que possível.
- Congelar/controlar o relógio em testes de antecedência e vigência.
- Não depender da ordem dos testes.
- Não depender de provedores de mensagens externas na V1.
- Nomes de testes descrevem regra e resultado em português.
- Fixtures financeiras usam `Decimal` e deixam a fórmula legível.
- Testes de autorização devem provar também os acessos proibidos.
