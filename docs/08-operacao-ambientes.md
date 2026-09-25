# Logs, auditoria, Docker e ambientes

## 1. Três responsabilidades distintas

```text
Frontend       → feedback imediato ao usuário
NestJS Logger  → diagnóstico técnico
PostgreSQL     → histórico e auditoria de negócio
```

Log técnico não substitui `CorrecaoAtendimento`, e uma mensagem ao usuário não substitui log de falha.

## 2. Logs

Registrar de forma estruturada:

- nível e timestamp;
- ambiente;
- método, rota, status e duração;
- identificador de correlação/requisição;
- `usuarioId` quando autenticado, sem dados pessoais desnecessários;
- contexto do módulo;
- erro interno sanitizado.

Nunca registrar:

- senha ou `senhaHash`;
- JWT completo;
- `JWT_SECRET` ou credenciais do banco;
- corpos completos que contenham segredos;
- stack trace na resposta HTTP.

## 3. Auditoria de negócio

Na V1, a auditoria explícita concentra-se em:

- quem cancelou Agendamento e quando;
- quem registrou Pagamento de Assinatura;
- quem corrigiu Atendimento, motivo e snapshots antes/depois;
- timestamps de criação, atualização e finalização.

Não criar uma tabela genérica de auditoria para tudo. Preservar histórico por valores copiados e desativação de cadastros.

## 4. Desenvolvimento local

O fluxo oficial é:

```text
NestJS executado localmente
PostgreSQL executado no Docker Compose
```

O `docker-compose.yml` da raiz deve subir inicialmente apenas o PostgreSQL com volume nomeado, healthcheck e porta configurável. Backend e frontend podem ganhar imagens depois, quando houver necessidade de deploy reproduzível.

## 5. Ambientes

### development

- logs legíveis e detalhados;
- Swagger habilitado;
- PostgreSQL Docker;

### test

- banco separado;
- dados descartáveis;
- configuração determinística;
- migrations aplicadas antes da suíte de integração/E2E.

### production

- segredos injetados pelo ambiente/plataforma;
- CORS restrito;
- logs estruturados sem dados sensíveis;
- Swagger protegido ou desabilitado;
- migrations executadas como etapa controlada de release;
- backup, retenção e restauração testada no PostgreSQL.

## 6. Variáveis de ambiente

O `.env.example` deve documentar, sem valores secretos:

```env
NODE_ENV=
PORT=
DATABASE_URL=
JWT_SECRET=
JWT_EXPIRES_IN=
APP_TIMEZONE=
FRONTEND_URL=
CORS_ORIGINS=
ADMIN_INICIAL_EMAIL=
ADMIN_INICIAL_SENHA=
```

Validar configurações no startup e falhar cedo quando uma variável obrigatória estiver ausente.

## 7. Datas e fuso

- Instantes de auditoria são persistidos com timezone, preferencialmente UTC.
- Datas e horários civis da agenda são interpretados no `APP_TIMEZONE` configurado para a barbearia.
- Não depender silenciosamente do timezone do sistema operacional.
- A documentação OpenAPI informa o formato esperado de datas e horários.

## 8. Backup e mudanças destrutivas

- A aplicação não executa backup por conta própria na V1; a infraestrutura de produção deve fazê-lo.
- Antes de migrations destrutivas, criar plano de migração e restauração.
- Não apagar volume local, banco ou migrations como atalho sem autorização explícita.
- Exclusões físicas de registros históricos são proibidas por padrão.
