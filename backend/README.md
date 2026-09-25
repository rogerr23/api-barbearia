# Backend

API NestJS da barbearia. O PostgreSQL roda no Docker Compose da raiz; o backend roda localmente.

## Requisitos e ambiente

- Node.js LTS (22 ou superior), npm e Docker Compose.
- PostgreSQL saudável conforme o [README da raiz](../README.md).
- Banco `barbearia_db` para desenvolvimento e `barbearia_test` para testes. Crie o segundo uma vez, a partir da raiz:

```bash
docker compose exec postgres createdb -U barbearia -O barbearia barbearia_test
```

Se o banco já existir, não repita o comando. Se alterar `POSTGRES_USER` no `.env` da raiz, ajuste o usuário acima.

Na pasta `backend/`, copie `.env.example` para `.env` e `.env.test.example` para `.env.test`. Substitua `SENHA_LOCAL` pela senha do `.env` da raiz e ajuste a porta se necessário. Os dois arquivos locais são ignorados pelo Git. A configuração valida URL, porta e fuso no startup; em testes, o nome do banco precisa terminar em `_test`.

```bash
cd backend
npm ci
npm run prisma:validate
npm run prisma:generate
npx prisma migrate deploy
npm run start:dev
```

`prisma migrate deploy` aplica as migrations pendentes em `barbearia_db` sem apagar dados. Verifique a inicialização em `GET http://localhost:3000/saude`, que retorna `{ "status": "ok" }`. O Prisma conecta ao banco durante a inicialização.

## Verificações

```bash
npm run lint
npm run format:check
npm test -- --runInBand
npm run test:integration -- --runInBand
npm run test:e2e -- --runInBand
npm run typecheck
npm run build
```

O teste de integração e o teste HTTP aplicam as migrations pendentes em `barbearia_test` antes de iniciar. O comando `npm run db:test:migrate` verifica `NODE_ENV=test` e exige nome de banco terminado em `_test`, evitando migrations de teste em `barbearia_db`. Use `npm run format` ou `npm run lint:fix` para corrigir estilo durante o desenvolvimento.
