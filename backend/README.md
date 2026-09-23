# Backend

Aplicação NestJS da API da barbearia. Nesta primeira task, ela ainda não usa banco de dados nem autenticação.

## Requisitos

- Node.js LTS (22 ou superior)
- npm

## Execução

```bash
cd backend
npm ci
npm run start:dev
```

A API escuta na porta `3000` por padrão. Para usar outra porta, defina `PORT` no ambiente antes de iniciar. Nesta task, o arquivo `.env` ainda não é carregado automaticamente; isso será feito na Task 03.

Verifique a inicialização em `GET http://localhost:3000/saude`, que retorna `{ "status": "ok" }`.

## Verificações

```bash
npm run lint
npm run format:check
npm test -- --runInBand
npm run test:e2e -- --runInBand
npm run typecheck
npm run build
```

Use `npm run format` ou `npm run lint:fix` para corrigir estilo durante o desenvolvimento.
