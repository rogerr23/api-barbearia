# Visão, escopo e requisitos

## 1. Objetivo

Construir uma API REST para a operação e a gestão de uma única barbearia. A V1 atende três perfis — Cliente, Barbeiro e Administrador — e cobre contas, catálogo, agenda, agendamentos, atendimentos, assinaturas, pagamentos manuais e indicadores.

O repositório chama-se `api-barbearia` e terá esta organização:

```text
api-barbearia/
├── backend/
├── frontend/          # implementação futura
├── docs/
├── docker-compose.yml
├── README.md
└── AGENTS.md
```

O backend é o escopo imediato. O frontend será criado futuramente, mas a API deve fornecer respostas claras para feedback visual imediato.

## 2. Perfis e fronteiras

### Cliente

- cria a própria conta;
- consulta e atualiza o próprio perfil;
- consulta serviços e barbeiros habilitados;
- consulta horários disponíveis;
- agenda, reagenda e cancela dentro das regras;
- consulta os próprios agendamentos e histórico;
- consulta e cancela a própria assinatura, mantendo-a até o fim da vigência.

### Barbeiro

- tem a conta criada por Administrador;
- troca obrigatoriamente a senha temporária no primeiro acesso;
- consulta e atualiza o próprio perfil permitido;
- configura somente a própria disponibilidade e os próprios bloqueios;
- consulta e cancela somente agendamentos vinculados a ele;
- registra atendimentos próprios, agendados ou avulsos;
- consulta somente seu histórico, produção e rendimento.

### Administrador

- acessa conta inicial criada por seed, sem cadastro público;
- gerencia clientes, barbeiros, serviços, planos, assinaturas e pagamentos;
- define o horário de funcionamento da barbearia;
- visualiza todas as agendas, mas não altera a disponibilidade pessoal do barbeiro;
- cancela qualquer agendamento;
- registra atendimentos avulsos;
- corrige atendimentos concluídos com trilha de auditoria;
- consulta indicadores gerais e financeiros.

## 3. Requisitos funcionais

### Contas e acesso

| ID | Requisito |
|---|---|
| RF01 | Permitir cadastro público de Cliente com nome, bairro, telefone, e-mail e senha. |
| RF02 | Permitir login único por e-mail e senha e identificar o perfil autenticado. |
| RF03 | Permitir a cada perfil consultar sua área e apenas os recursos autorizados. |
| RF04 | Permitir ao Cliente e ao Barbeiro consultar e atualizar os próprios dados autorizados. |
| RF05 | Permitir ao Administrador criar, editar, ativar e desativar contas de Barbeiro. |
| RF06 | Criar Barbeiro com senha temporária e exigir nova senha no primeiro acesso. |
| RF07 | Permitir recuperação de senha por e-mail para Cliente, Barbeiro e Administrador. |
| RF08 | Permitir logout no cliente consumidor; na API stateless da V1, o token deixa de ser usado pelo cliente. |

### Serviços e agenda

| ID | Requisito |
|---|---|
| RF09 | Permitir ao Administrador criar, consultar, editar, ativar e desativar Serviços. |
| RF10 | Permitir associar Serviços específicos aos Barbeiros habilitados. |
| RF11 | Permitir ao Administrador configurar o horário de funcionamento da barbearia. |
| RF12 | Permitir ao Barbeiro configurar sua própria disponibilidade recorrente dentro do funcionamento. |
| RF13 | Permitir ao Barbeiro criar e remover bloqueios excepcionais próprios. |
| RF14 | Calcular e listar horários disponíveis em slots de 30 minutos. |

### Agendamentos

| ID | Requisito |
|---|---|
| RF15 | Permitir ao Cliente criar Agendamento escolhendo Serviço, Barbeiro, data e horário disponível. |
| RF16 | Permitir ao Cliente reagendar até 2 horas antes do início atual, aplicando as mesmas validações de uma nova reserva. |
| RF17 | Permitir ao Cliente cancelar seu Agendamento até 2 horas antes. |
| RF18 | Permitir ao Barbeiro cancelar seus próprios Agendamentos. |
| RF19 | Permitir ao Administrador cancelar qualquer Agendamento. |
| RF20 | Permitir consultas de agenda e histórico conforme o perfil. |
| RF21 | Permitir registrar falta e conclusão sem estado intermediário `EM_ANDAMENTO`. |

### Atendimentos e financeiro

| ID | Requisito |
|---|---|
| RF22 | Permitir ao Barbeiro responsável registrar Atendimento agendado. |
| RF23 | Permitir ao Barbeiro ou Administrador registrar Atendimento avulso, com Cliente cadastrado ou pessoa sem conta. |
| RF24 | Permitir registrar Serviço realizado diferente do Serviço agendado. |
| RF25 | Registrar preço, desconto, cobertura, comissão, repasse, gorjeta, extras, total e forma de pagamento aplicados. |
| RF26 | Permitir múltiplos extras descritivos em um Atendimento. |
| RF27 | Permitir ao Administrador corrigir Atendimento concluído, exigindo motivo e preservando antes/depois. |

### Planos e assinaturas

| ID | Requisito |
|---|---|
| RF28 | Permitir ao Administrador consultar e manter Planos, serviços cobertos, descontos e repasses fixos. |
| RF29 | Permitir contratar uma Assinatura para Cliente sem outra Assinatura vigente. |
| RF30 | Permitir registrar manualmente Pagamento de Assinatura e sua vigência. |
| RF31 | Permitir solicitar cancelamento sem retirar benefícios antes do fim do período pago. |
| RF32 | Aplicar cobertura integral ou desconto conforme Plano e Serviço no Atendimento. |

### Indicadores e histórico

| ID | Requisito |
|---|---|
| RF33 | Disponibilizar Dashboard administrativo por hoje, semana, mês ou período personalizado. |
| RF34 | Exibir faturamento, atendimentos, assinantes, ticket médio, serviços, cancelamentos/faltas, clientes novos/recorrentes e origem por bairro. |
| RF35 | Exibir produção, valores gerados e rendimento por Barbeiro ao Administrador. |
| RF36 | Disponibilizar Dashboard do Barbeiro somente com seus próprios atendimentos, serviços, comissão, repasse, gorjeta e rendimento. |
| RF37 | Preservar e permitir consulta dos históricos autorizados de Agendamentos, Atendimentos, Assinaturas e Pagamentos. |

## 4. Requisitos não funcionais

| ID | Requisito |
|---|---|
| RNF01 | A futura interface deve ser responsiva e priorizar o fluxo mobile do Cliente. |
| RNF02 | Operações frequentes devem exigir poucas etapas e fornecer feedback imediato de sucesso ou erro. |
| RNF03 | A API deve usar validação de entrada e respostas HTTP previsíveis. |
| RNF04 | Senhas, tokens e segredos nunca podem ser registrados ou armazenados em texto puro quando houver alternativa segura. |
| RNF05 | Autenticação e autorização devem ser aplicadas por perfil e por propriedade do recurso. |
| RNF06 | Coletar apenas dados pessoais necessários; usa-se bairro, não CEP ou endereço completo. |
| RNF07 | Proteger a integridade com constraints, transações e validações de negócio. |
| RNF08 | Impedir dupla reserva do mesmo Barbeiro, inclusive sob concorrência. |
| RNF09 | Preservar valores financeiros históricos sem recalculá-los a partir de configurações atuais. |
| RNF10 | Manter histórico por desativação/preservação em vez de exclusão física de dados relacionados. |
| RNF11 | Documentar a API com OpenAPI/Swagger e manter documentação sincronizada. |
| RNF12 | Manter testes simples e relevantes para as regras críticas. |
| RNF13 | Separar os ambientes `development`, `test` e `production`, inclusive seus bancos. |
| RNF14 | Prever backup e restauração no ambiente de produção; isso não é automatizado pela aplicação local da V1. |

## 5. Fora do escopo da V1

- frontend implementado;
- refresh token e revogação centralizada de access tokens;
- verificação obrigatória do e-mail para ativar cadastro;
- pagamentos online, gateway e pagamento dividido;
- lembretes ou notificações de agendamento;
- resumo diário por e-mail para Barbeiro;
- WhatsApp, push, filas, RabbitMQ ou Kafka;
- múltiplas unidades de barbearia;
- microserviços, CQRS, Event Sourcing, Redis, Elasticsearch ou Kubernetes;
- catálogo/estoque de produtos;
- histórico separado de reagendamentos;
- status `EM_ANDAMENTO`.

Notificações de confirmação, lembrete de 1 dia, lembrete de 1 hora, cancelamento/reagendamento e resumo diário ficam planejadas para a V2.
