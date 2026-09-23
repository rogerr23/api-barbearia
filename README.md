# api-barbearia

API REST para gestão de uma única barbearia. O backend é um monólito modular em NestJS e TypeScript; PostgreSQL e Prisma entram nas próximas tasks da Fase 0. O frontend está reservado para uma fase futura.

## Comecar

Consulte [backend/README.md](backend/README.md) para instalar dependências, iniciar a API e executar as verificações. As regras e decisões da V1 estão em [docs/README.md](docs/README.md), e a sequência das tasks está em [docs/09-plano-implementacao.md](docs/09-plano-implementacao.md).

## PostgreSQL local

O Docker Compose sobe somente o PostgreSQL; o NestJS continua executado localmente. Antes da primeira inicialização, copie `.env.example` para `.env` na raiz e preencha `POSTGRES_PASSWORD` com uma senha local. `POSTGRES_PORT` pode ser alterada se a porta `5432` já estiver em uso. A porta fica acessível apenas em `127.0.0.1`.

```bash
cp .env.example .env
# Edite .env e defina POSTGRES_PASSWORD
docker compose up -d
docker compose ps
docker compose exec postgres pg_isready -U barbearia -d barbearia_db
```

Para confirmar uma conexão SQL, use `docker compose exec postgres psql -U barbearia -d barbearia_db -c 'SELECT 1;'`. Se alterar `POSTGRES_USER` ou `POSTGRES_DB` no `.env`, ajuste também esses comandos.

Para parar sem apagar os dados, execute `docker compose stop`. Para remover o contêiner e a rede, preservando o volume, execute `docker compose down`. O volume `postgres_data` mantém os dados entre reinícios. As variáveis de criação de usuário, senha e banco são aplicadas apenas quando o volume está vazio; alterá-las no `.env` depois não modifica o banco existente.

O backend usa `barbearia_db` em desenvolvimento e `barbearia_test` nos testes. Consulte o [README do backend](backend/README.md) para criar o banco de teste, configurar os arquivos `.env` locais e gerar o Prisma Client.

## Estrutura

```text
backend/   API NestJS
frontend/  reservado para implementação futura
docs/      fonte de verdade da V1
```
