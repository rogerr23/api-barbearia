# Regras de negócio

## 1. Usuários e contas

- **RN01 — Perfis:** todo `Usuario` possui exatamente um perfil: `CLIENTE`, `BARBEIRO` ou `ADMINISTRADOR`.
- **RN02 — E-mail único:** cada e-mail pertence a uma única conta no sistema, independentemente do perfil. Deve ser normalizado antes de persistir ou comparar e protegido por `UNIQUE` no banco.
- **RN03 — Cliente:** cria a própria conta. A criação de `Usuario + Cliente` é atômica.
- **RN04 — Barbeiro:** somente Administrador cria conta de Barbeiro. A criação de `Usuario + Barbeiro` é atômica.
- **RN05 — Primeiro acesso:** o Barbeiro nasce com senha temporária e `primeiro_acesso = true`. Até trocar a senha, só pode acessar as operações necessárias ao primeiro acesso.
- **RN06 — Administrador:** não existe cadastro público. O Administrador inicial é criado por seed/configuração segura.
- **RN07 — Recuperação adiada:** a V1 não oferece fluxo de recuperação de senha; sua definição fica para uma versão posterior.
- **RN08 — Bairro:** `Cliente.bairro` é obrigatório. CEP e endereço completo não fazem parte da V1.
- **RN09 — Preservação:** contas relacionadas a históricos são desativadas, não apagadas fisicamente.

## 2. Serviços

- **RN10 — Duração fixa:** todo Serviço dura exatamente **30 minutos** na V1, inclusive `Corte + Barba` e serviços adicionais.
- **RN11 — Um slot:** cada Agendamento ocupa exatamente um slot de 30 minutos.
- **RN12 — Serviço independente:** `Corte`, `Barba` e `Corte + Barba` são três Serviços distintos. `Corte + Barba` não é combinação dinâmica.
- **RN13 — Básicos:** todos os Barbeiros ativos realizam os três Serviços básicos.
- **RN14 — Específicos:** outros Serviços podem exigir associações em `BarbeiroServico`.
- **RN15 — Preço único:** o preço pertence ao Serviço e não varia por Barbeiro.
- **RN16 — Descrição:** a descrição de Serviço é sempre opcional.
- **RN17 — Inativação:** Serviço inativo não aparece em novas reservas, mas permanece no histórico.

## 3. Funcionamento e agenda

- **RN18 — Funcionamento:** Administrador define os períodos gerais de funcionamento da barbearia.
- **RN19 — Disponibilidade:** somente o próprio Barbeiro modifica sua disponibilidade recorrente e bloqueios; Administrador apenas visualiza.
- **RN20 — Limite:** a disponibilidade do Barbeiro deve estar contida no funcionamento da barbearia.
- **RN21 — Períodos:** podem existir vários períodos no mesmo dia, como `09:00–13:00` e `14:00–19:00`.
- **RN22 — Bloqueios:** podem ocupar parte do dia ou o dia inteiro; o motivo é opcional.
- **RN23 — Slots calculados:** slots não são persistidos. São calculados a partir de funcionamento, disponibilidade, bloqueios e Agendamentos ativos.
- **RN24 — Grade:** horários de início são alinhados em intervalos de 30 minutos.

## 4. Agendamentos

- **RN25 — Dados:** todo Agendamento possui Cliente, Barbeiro, Serviço, data/hora e status.
- **RN26 — Janela mínima:** um Cliente só pode agendar ou reagendar com pelo menos **1h30** de antecedência.
- **RN27 — Janela máxima:** um Cliente só pode agendar ou reagendar para até **7 dias** à frente.
- **RN28 — Disponibilidade:** o Serviço deve estar ativo, o Barbeiro ativo e habilitado, e o slot deve caber integralmente em sua disponibilidade sem bloqueio ou conflito.
- **RN29 — Concorrência:** a disponibilidade deve ser revalidada dentro da operação de gravação. Duas solicitações concorrentes não podem reservar o mesmo slot do mesmo Barbeiro.
- **RN30 — Um Serviço:** cada Agendamento contém somente um Serviço.
- **RN31 — Repetição diária:** o Cliente não pode manter dois Agendamentos não cancelados para o mesmo Serviço no mesmo dia.
- **RN32 — Serviços diferentes:** o Cliente pode agendar Serviços diferentes no mesmo dia, em horários diferentes.
- **RN33 — Cancelamento do Cliente:** permitido até **2 horas** antes do início.
- **RN34 — Cancelamento do Barbeiro:** pode cancelar somente Agendamentos vinculados a ele, sem limite de antecedência.
- **RN35 — Cancelamento do Administrador:** pode cancelar qualquer Agendamento.
- **RN36 — Auditoria do cancelamento:** registrar data/hora e `cancelado_por_usuario_id`; motivo é opcional.
- **RN37 — Reagendamento:** o Cliente pode reagendar até **2 horas antes** do início atual. A operação altera o próprio Agendamento na V1, reexecutando todas as regras de uma nova reserva. Não há histórico separado de reagendamento.
- **RN38 — Status:** somente `AGENDADO`, `CONCLUIDO`, `CANCELADO` e `FALTOU`. Não existe `EM_ANDAMENTO`.

## 5. Atendimentos

- **RN39 — Realidade executada:** Agendamento representa o planejado; Atendimento representa o que de fato ocorreu.
- **RN40 — Agendado:** um Agendamento pode originar no máximo um Atendimento.
- **RN41 — Avulso:** Barbeiro e Administrador podem registrar Atendimento sem Agendamento.
- **RN42 — Pessoa sem conta:** Atendimento avulso pode não ter `cliente_id`. Não se cria Cliente fictício; o registro conta para produção e faturamento, mas não para métricas que dependem da identidade ou bairro.
- **RN43 — Responsável:** Atendimento exige Barbeiro e Serviço. O Barbeiro registra os próprios atendimentos; o Administrador pode registrar avulsos e atuar administrativamente.
- **RN44 — Serviço efetivo:** o Serviço do Atendimento pode ser diferente do Serviço do Agendamento.
- **RN45 — Sem início manual:** não há ação/status de início. O Atendimento é registrado ao finalizar o serviço.
- **RN46 — Valores históricos:** Atendimento copia e preserva preço, desconto, comissão, repasse e totais aplicados no momento.
- **RN47 — Extras:** podem existir vários; cada extra exige descrição e valor não negativo. Extras não geram comissão na V1.
- **RN48 — Pagamento:** não há pagamento dividido nem estado pendente. Se `valor_total > 0`, a forma de pagamento é obrigatória; se for zero, pode ser nula.
- **RN49 — Formas de pagamento:** `PIX`, `DINHEIRO`, `CREDITO` e `DEBITO`.
- **RN50 — Correção:** depois de concluído, Barbeiro não altera Atendimento. Administrador pode corrigi-lo com motivo obrigatório e snapshot antes/depois.

## 6. Planos e assinaturas

- **RN51 — Plano Corte:** custa **R$ 100,00/mês**, cobre Corte ilimitado durante a vigência e concede desconto configurado nos Serviços não cobertos, incluindo Barba.
- **RN52 — Plano Completo:** custa **R$ 110,00/mês**, cobre Corte, Barba e Corte + Barba de forma ilimitada e concede desconto configurado nos demais Serviços não cobertos.
- **RN53 — Sem cota:** não existe limite mensal de utilizações dos Serviços cobertos.
- **RN54 — Sem prioridade:** Assinatura não altera disponibilidade nem regras de Agendamento.
- **RN55 — Uma vigente:** um Cliente pode ter várias Assinaturas históricas, mas apenas uma vigente por vez.
- **RN56 — Pagamento manual:** Administrador registra manualmente o pagamento, a forma e o período de vigência.
- **RN57 — Cancelamento:** a solicitação muda o status para `CANCELAMENTO_AGENDADO`; os benefícios continuam até `data_fim_periodo`, quando passa a `EXPIRADA` e não renova.
- **RN58 — Cobertura:** Serviço coberto cobra R$ 0 pelo Serviço e usa repasse fixo. Serviço não coberto aplica o desconto do Plano e usa comissão sobre o valor efetivamente cobrado.
- **RN59 — Histórico:** valores pagos, período, desconto e repasse aplicados não mudam quando o Plano é alterado depois.

## 7. Comissão, repasse, gorjeta e faturamento

- **RN60 — Comissão padrão:** Serviços pagos usam comissão de **50%** sobre `valor_servico_cobrado`, após desconto. O percentual atual pode ser configurado por Barbeiro, mas o padrão da V1 é 50%.
- **RN61 — Repasse:** Serviço coberto por Assinatura usa o valor fixo configurado em `PlanoServico` e não usa comissão percentual.
- **RN62 — Exclusividade:** um mesmo Serviço em um Atendimento usa comissão ou repasse, nunca ambos.
- **RN63 — Gorjeta:** pertence integralmente ao Barbeiro, não gera comissão e não entra no faturamento da barbearia.
- **RN64 — Rendimento:** `valor_comissao + valor_repasse + gorjeta`.
- **RN65 — Total pago:** `valor_servico_cobrado + soma(extras) + gorjeta`.
- **RN66 — Receita do Atendimento:** `valor_servico_cobrado + soma(extras)`.
- **RN67 — Faturamento geral:** receita dos Atendimentos + Pagamentos de Assinatura; gorjetas ficam separadas.
- **RN68 — Ticket médio:** `(receita de Serviços pagos + Extras dos Atendimentos concluídos no período) / quantidade de Atendimentos concluídos no período`. Mensalidades e gorjetas ficam fora. Quando não houver Atendimentos, retornar zero sem divisão.

## 8. Dashboards e acesso aos dados

- **RN69 — Períodos:** indicadores aceitam hoje, semana, mês ou período personalizado.
- **RN70 — Conclusão:** somente Atendimentos efetivamente registrados entram em produção e faturamento.
- **RN71 — Administrativo:** pode ver dados agregados gerais, inclusive faturamento, assinantes, serviços, bairros e dados por Barbeiro.
- **RN72 — Barbeiro:** visualiza apenas seus próprios dados, incluindo comissão, repasse, gorjeta e rendimento.
- **RN73 — Cliente:** acessa somente seus dados, Agendamentos, Assinatura e histórico.
- **RN74 — Origem:** métricas por bairro consideram apenas Clientes cadastrados com bairro conhecido.

## 9. Feedback e comunicação

- **RN75 — Feedback imediato:** cadastro, agendamento, cancelamento, reagendamento e demais mutações retornam status e mensagem suficientes para o frontend mostrar sucesso ou erro imediatamente.
- **RN76 — Cadastro:** criar a conta retorna confirmação pela API, sem e-mail de boas-vindas.
- **RN77 — Recuperação:** não há solicitação ou redefinição de senha na V1.
- **RN78 — Escopo V1:** e-mail identifica a conta no cadastro e login; não há envio de e-mail, WhatsApp ou outra mensagem externa.

## 10. Regras complementares preservadas da especificação anterior

- **RN79 — Sem sobreposição do Cliente:** o Cliente não pode manter Agendamentos ativos sobrepostos, mesmo com Barbeiros diferentes.
- **RN80 — Atendimento avulso e agenda:** um Atendimento avulso não pode ocupar período já reservado ou bloqueado para o Barbeiro.
- **RN81 — Falta e cancelamento:** Agendamentos `FALTOU` ou `CANCELADO` permanecem no histórico, não geram Atendimento e não entram em faturamento ou rendimento.
- **RN82 — Ciclo mensal:** a vigência da Assinatura acompanha o ciclo individual do Cliente, iniciado na contratação ou renovação, e não necessariamente o mês do calendário.
- **RN83 — Benefício exige conta:** cobertura e desconto de Assinatura exigem Atendimento vinculado ao Cliente titular e Assinatura vigente.
- **RN84 — Serviço efetivo:** cobrança, cobertura, comissão, repasse, histórico e métricas usam o Serviço efetivamente realizado.
- **RN85 — Desativação com pendências:** Barbeiro ou Cliente com Agendamentos futuros ativos, e Serviço com Agendamentos futuros ativos, só podem ser desativados depois de resolvê-los. Cliente com Assinatura vigente segue a regra de cancelamento até o fim do período pago.
- **RN86 — Plano fora de oferta:** inativar um Plano impede novas contratações, mas não retira benefícios de Assinaturas vigentes.
- **RN87 — Sem alinhamento ou franquia:** `Alinhamento` não é Serviço básico nem benefício dos Planos iniciais; não há franquia de cinco usos mensais.
