# API, autenticação e segurança

## 1. Respostas HTTP

Usar os códigos de forma consistente:

| Situação | Status |
|---|---:|
| Consulta/alteração bem-sucedida | `200 OK` |
| Recurso criado | `201 Created` |
| Sucesso sem corpo | `204 No Content` |
| Entrada ou regra inválida | `400 Bad Request` |
| Não autenticado/token inválido | `401 Unauthorized` |
| Autenticado sem permissão | `403 Forbidden` |
| Recurso inexistente | `404 Not Found` |
| Concorrência, duplicidade ou estado conflitante | `409 Conflict` |
| Erro inesperado | `500 Internal Server Error` |

Não envolver toda resposta em envelopes artificiais como `{ "success": true, "data": ... }`. Retornar o recurso ou representação adequada diretamente.

Erros devem manter formato previsível, compatível com o NestJS:

```json
{
  "statusCode": 409,
  "message": "Este horário não está mais disponível.",
  "error": "Conflict"
}
```

Erros de validação podem trazer `message` como lista. Nunca retornar stack trace, SQL, nome do provedor ou segredo ao consumidor.

## 2. Feedback imediato

O backend não controla toast ou modal, mas deve permitir que o frontend apresente resultado imediato. Toda mutação importante retorna:

- status correto;
- mensagem compreensível quando necessário;
- recurso criado/alterado quando útil.

Isso vale para cadastro, login, primeiro acesso, agendamento, reagendamento, cancelamento, Atendimento, Assinatura e operações administrativas.

Na V1, a interface futura mostra o resultado da operação usando a resposta HTTP. A API não envia e-mail, WhatsApp ou outra mensagem externa e não armazena notificações para exibição posterior.

Exemplos de mensagens:

- `Conta criada com sucesso.`
- `Agendamento realizado com sucesso.`
- `Agendamento cancelado com sucesso.`
- `Este horário não está mais disponível.`
- `O cancelamento pelo cliente deve ocorrer com pelo menos 2 horas de antecedência.`

## 3. Autenticação

Existe um único endpoint de login para os três perfis:

```http
POST /auth/login
```

O JWT contém apenas o necessário, por exemplo:

```json
{
  "sub": 15,
  "perfil": "CLIENTE"
}
```

Não incluir nome, telefone, bairro, assinatura ou dados financeiros no token.

Na V1 há somente **access token** com expiração configurável. Não implementar refresh token. A API é stateless; logout significa descartar o token no cliente. Uma revogação centralizada fica fora do escopo.

## 4. Senhas e primeiro acesso

- Hash de senhas com Argon2 e parâmetros definidos centralmente.
- Nunca armazenar, retornar ou registrar senha pura.
- Administrador define senha temporária ao criar Barbeiro.
- `primeiro_acesso = true` bloqueia as funcionalidades normais do Barbeiro.
- A troca bem-sucedida grava novo hash e define `primeiro_acesso = false` na mesma transação.
- Administrador nunca visualiza a senha atual do Barbeiro.

## 5. Autorização em duas camadas

```text
JwtAuthGuard → token válido?
RolesGuard   → perfil pode usar esta operação?
Service      → este usuário pode agir sobre este recurso específico?
```

Exemplos:

- `BARBEIRO` pode acessar cancelamento, mas o Service confirma que o Agendamento pertence a ele.
- `CLIENTE` usa `sub` do token para buscar seu `clienteId`; não escolhe outro Cliente por parâmetro.
- `ADMINISTRADOR` pode corrigir Atendimento, mas a operação registra o Administrador autenticado, não um ID fornecido pelo corpo.

## 6. E-mail e comunicação na V1

O e-mail é coletado, normalizado e usado como identificador único de cadastro e login. Não há verificação de e-mail nem envio de boas-vindas, recuperação de senha, confirmação de Agendamento, lembrete, cancelamento, reagendamento ou resumo diário.

A recuperação de senha fica para uma versão posterior. Na V1, não criar `/auth/esqueci-senha`, `/auth/redefinir-senha`, serviço de e-mail nem configuração de provedor. A tabela `RecuperacaoSenha` da migration inicial permanece sem uso; sua existência não torna o fluxo parte da V1.

O frontend futuro deve apresentar a resposta da API após cada ação. Isso é feedback da operação atual, sem central de notificações ou mensagens persistidas.

## 7. Outras proteções

- CORS explícito por ambiente; nunca `origin: *` em produção sem justificativa.
- `ValidationPipe` global com transformação e rejeição de propriedades não permitidas.
- segredos somente em variáveis de ambiente; `.env` fora do Git.
- `JWT_SECRET` forte e diferente por ambiente.
- Swagger protegido ou desabilitado em produção conforme configuração.
- Rate limiting de login é recomendável, mas pode ser implementado depois do fluxo básico sem Redis.
- Respostas de login não distinguem e-mail inexistente de senha incorreta.
- Desativação do Usuário impede novo login e uso autenticado.
