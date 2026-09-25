# Documentação — api-barbearia

Esta pasta é a fonte oficial de decisões da V1 da API de gestão de barbearia.

O `der.md` é o DER principal atualizado. A antiga especificação consolidada foi substituída pelos documentos de requisitos e regras de negócio desta pasta.

## Ordem de leitura

1. [Visão, escopo e requisitos](./01-visao-requisitos.md)
2. [Regras de negócio](./02-regras-de-negocio.md)
3. [Modelagem e DER](./der.md)
4. [Arquitetura, stack e convenções](./04-arquitetura-stack-convencoes.md)
5. [API, autenticação e segurança](./05-api-seguranca.md)
6. [Persistência, Prisma e transações](./06-persistencia-prisma.md)
7. [Testes](./07-testes.md)
8. [Logs, auditoria, Docker e ambientes](./08-operacao-ambientes.md)
9. [Plano inicial de implementação](./09-plano-implementacao.md)

## Decisões finais que substituem versões anteriores

- A Assinatura Completa custa **R$ 110,00**, não R$ 115,00.
- Todos os serviços duram **exatamente 30 minutos**, inclusive Corte + Barba. Não há duração configurável na V1.
- E-mail é usado apenas no cadastro e login; a V1 não envia mensagens externas.
- Recuperação de senha fica para depois da V1.
- O domínio, o código e os endpoints usam português; termos técnicos consolidados podem permanecer em inglês.
- Não existe status `EM_ANDAMENTO`.
- As respostas da API permitem feedback imediato na interface futura; notificações externas ficam fora da V1.

Se uma anotação, conversa antiga ou implementação divergir destes documentos, a decisão final registrada aqui prevalece. Mudanças futuras devem atualizar a documentação e os testes no mesmo trabalho.
