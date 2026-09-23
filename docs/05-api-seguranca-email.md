# API, autenticação, segurança e e-mail

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

Isso vale para cadastro, login, primeiro acesso, recuperação, agendamento, reagendamento, cancelamento, Atendimento, Assinatura e operações administrativas.

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

## 6. Recuperação de senha

Disponível para Cliente, Barbeiro e Administrador.

### Solicitação

```text
e-mail normalizado
  → procurar Usuario ativo
  → gerar token aleatório criptograficamente seguro
  → persistir somente token_hash + expiração
  → invalidar/limitar tokens anteriores conforme implementação
  → enviar link por e-mail
```

A resposta é sempre neutra:

> Se o e-mail estiver cadastrado, enviaremos as instruções para redefinição da senha.

### Redefinição

- validar hash, expiração e `utilizado_em`;
- atualizar a senha com Argon2;
- marcar token como usado;
- executar essas alterações em uma transação;
- token é de uso único;
- não registrar token puro em log.

O tempo de validade é configuração de ambiente, documentado em `.env.example`.

## 7. E-mail na V1

O módulo `email` expõe operações de intenção, sem acoplar os domínios ao provedor:

```text
EmailService.enviarBoasVindas(...)
EmailService.enviarRecuperacaoSenha(...)
```

### Boas-vindas

Depois do commit de `Usuario + Cliente`, tentar enviar a mensagem. A resposta de cadastro não deve ficar dependente do sucesso do provedor: falha de e-mail não remove a conta e é registrada tecnicamente.

### Recuperação

O envio é essencial para completar o fluxo. Ainda assim, a API não revela existência da conta nem detalhes do provedor. A V1 não usa fila; registrar falha de forma segura e permitir nova solicitação conforme os limites definidos.

### Não pertence à V1

- confirmação de Agendamento por e-mail;
- lembretes de 1 dia e 1 hora;
- mensagens de cancelamento/reagendamento;
- resumo diário do Barbeiro.

## 8. Outras proteções

- CORS explícito por ambiente; nunca `origin: *` em produção sem justificativa.
- `ValidationPipe` global com transformação e rejeição de propriedades não permitidas.
- segredos somente em variáveis de ambiente; `.env` fora do Git.
- `JWT_SECRET` forte e diferente por ambiente.
- Swagger protegido ou desabilitado em produção conforme configuração.
- Rate limiting de login e recuperação é recomendável, mas pode ser implementado depois do fluxo básico sem Redis.
- Respostas de login não distinguem e-mail inexistente de senha incorreta.
- Desativação do Usuário impede novo login e uso autenticado.
