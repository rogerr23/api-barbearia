# Arquitetura, stack e convenções

## 1. Arquitetura

A aplicação é um **monólito modular REST** em NestJS. Não usar microserviços na V1.

Fluxo padrão:

```text
Controller → Service → Repository → Prisma → PostgreSQL
```

- **Controller:** transporte HTTP, autenticação já resolvida e chamada do caso de uso.
- **DTO:** contrato e validação estrutural da entrada.
- **Service:** regras de negócio, autorização sobre o recurso e coordenação transacional.
- **Repository:** consultas e persistência específicas do domínio.
- **Prisma:** acesso tipado ao PostgreSQL; não contém regra de negócio.

Não criar `GenericRepository`, `BaseService`, camadas abstratas ou padrões adicionais sem uma necessidade concreta e documentada. Controllers não acessam Prisma diretamente. Services não devem espalhar consultas Prisma quando um Repository específico torna a intenção mais clara.

## 2. Stack oficial

| Área | Tecnologia |
|---|---|
| Linguagem | TypeScript |
| Runtime | Node.js LTS |
| Framework | NestJS |
| API | REST + JSON |
| Banco | PostgreSQL |
| ORM e migrations | Prisma + Prisma Migrate |
| Autenticação | JWT, somente access token na V1 |
| Hash de senha | Argon2 |
| Autorização | `JwtAuthGuard`, `RolesGuard` e validação no Service |
| Validação | `class-validator` + `class-transformer` |
| Documentação | Swagger / OpenAPI |
| Testes | Jest + Supertest |
| Qualidade | ESLint + Prettier |
| Infra local | Docker + Docker Compose para PostgreSQL |
| Gerenciador | npm |

Bibliotecas novas precisam resolver um problema real e ser justificadas no trabalho que as introduzir.

## 3. Organização do backend

```text
backend/
├── prisma/
│   ├── migrations/
│   ├── schema.prisma
│   └── seed.ts
├── src/
│   ├── auth/
│   ├── usuarios/
│   ├── clientes/
│   ├── barbeiros/
│   ├── servicos/
│   ├── agenda/
│   ├── agendamentos/
│   ├── atendimentos/
│   ├── planos/
│   ├── assinaturas/
│   ├── dashboard/
│   ├── email/
│   ├── prisma/
│   ├── common/
│   ├── config/
│   ├── app.module.ts
│   └── main.ts
├── test/
├── .env.example
└── package.json
```

### Responsabilidade dos módulos

- `auth`: login, JWT, primeiro acesso, alteração e recuperação de senha.
- `usuarios`: operações internas da conta; não expõe CRUD público genérico.
- `clientes`: cadastro público, perfil e consultas administrativas.
- `barbeiros`: criação administrativa, perfil, comissão e habilitações.
- `servicos`: catálogo e `BarbeiroServico`.
- `agenda`: funcionamento, disponibilidade, bloqueios e cálculo de slots.
- `agendamentos`: criar, reagendar, cancelar, faltar e consultar reservas.
- `atendimentos`: conclusão, avulsos, extras, cálculos e correções.
- `planos`: definição do produto, cobertura, desconto e repasse.
- `assinaturas`: contratação, pagamento manual, vigência e cancelamento.
- `dashboard`: consultas agregadas, sem entidade `Dashboard`.
- `email`: integração pequena com provedor de e-mail.
- `common`: somente código realmente compartilhado, como guards, decorators, filters e enums.
- `config`: leitura e validação de configuração externa.

Pagamento, comissão, gorjeta, extra, `BarbeiroServico` e `PlanoServico` não viram módulos autônomos na V1.

## 4. Português no domínio

Usar português em:

- pastas de domínio;
- classes de domínio (`AgendamentosService`);
- DTOs (`CriarAgendamentoDto`);
- métodos (`buscarHorariosDisponiveis`);
- variáveis (`clienteId`);
- modelos e campos Prisma (`Agendamento`, `horaInicio`);
- rotas (`/agendamentos`);
- enums e mensagens do negócio.

Termos técnicos consolidados permanecem em inglês: `Controller`, `Service`, `Repository`, `Module`, `DTO`, `Guard`, `JWT`, `Token`, `Payload`, `Prisma`, `Swagger`, `Docker`, `API`, `REST`, `HTTP`, `Exception`, `Interceptor`.

Não misturar sinônimos ingleses e portugueses para o mesmo domínio. Não criar `Customer`, `Appointment` ou `Subscription`.

## 5. Convenções de código

- arquivos: `kebab-case`, por exemplo `criar-agendamento.dto.ts`;
- classes e enums: `PascalCase`;
- funções, métodos e variáveis: `camelCase`;
- constantes: `UPPER_SNAKE_CASE` quando apropriado;
- módulos e Controllers no plural quando representam coleções: `AgendamentosController`;
- IDs internos numéricos; nunca confiar em um ID enviado pelo frontend para identificar o próprio usuário quando o JWT fornece essa identidade;
- `async/await`, sem misturar estilos assíncronos;
- DTOs não contêm regra de negócio;
- mensagens de erro são claras, estáveis e em português;
- valores monetários nunca usam `number` em cálculos sem tratamento decimal explícito;
- datas e horários usam APIs/tipos claros; não depender do fuso local implícito do servidor.

## 6. Endpoints orientativos

As rotas exatas podem ser refinadas ao implementar, preservando o domínio:

```text
POST   /auth/login
POST   /auth/esqueci-senha
POST   /auth/redefinir-senha
PATCH  /auth/primeiro-acesso

POST   /clientes
GET    /clientes/me
PATCH  /clientes/me

POST   /barbeiros
GET    /barbeiros
GET    /barbeiros/me

GET    /servicos
POST   /servicos
PATCH  /servicos/:id

GET    /agenda/horarios-disponiveis
GET    /barbeiros/me/disponibilidades
PUT    /barbeiros/me/disponibilidades
POST   /barbeiros/me/bloqueios
DELETE /barbeiros/me/bloqueios/:id

POST   /agendamentos
GET    /agendamentos/me
PATCH  /agendamentos/:id/reagendar
PATCH  /agendamentos/:id/cancelar

POST   /atendimentos
POST   /atendimentos/avulsos
PATCH  /atendimentos/:id/corrigir

GET    /assinaturas/me
POST   /assinaturas
PATCH  /assinaturas/:id/cancelar
POST   /assinaturas/:id/pagamentos

GET    /admin/dashboard/resumo
GET    /barbeiros/me/dashboard
```

Prefira `/me` para recursos do usuário autenticado. Prefixos como `/admin` podem ser usados para deixar consultas administrativas explícitas, sem substituir Guards.
