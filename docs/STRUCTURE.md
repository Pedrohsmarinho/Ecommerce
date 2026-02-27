# Estrutura do Monorepo

Este documento descreve a organização e estrutura do projeto.

## 📁 Estrutura de Diretórios

```
Ecommerce/
├── .github/              # GitHub Actions workflows
│   └── workflows/        # CI/CD pipelines
├── client/               # Frontend (a ser implementado)
├── docs/                 # Documentação do projeto
│   ├── ARCHITECTURE.md
│   ├── MELHORIAS-IMPLEMENTADAS.md
│   └── VALIDATION.md
├── server/               # Backend API
│   ├── dist/            # Código compilado
│   ├── node_modules/    # Dependências
│   ├── prisma/          # Schema e migrations do banco
│   │   ├── schema.prisma
│   │   └── migrations/
│   ├── src/             # Código fonte
│   │   ├── auth/        # Módulo de autenticação
│   │   ├── cart/        # Módulo de carrinho
│   │   ├── category/    # Módulo de categorias
│   │   ├── client/      # Módulo de clientes
│   │   ├── guards/      # Guards (autorização)
│   │   ├── health/      # Health checks
│   │   ├── interceptors/# Interceptors
│   │   ├── metrics/     # Métricas
│   │   ├── order/       # Módulo de pedidos
│   │   ├── prisma/      # Serviço Prisma
│   │   ├── product/     # Módulo de produtos
│   │   ├── redis/       # Serviço Redis
│   │   ├── report/      # Módulo de relatórios
│   │   ├── s3/          # Integração AWS S3
│   │   ├── user/        # Módulo de usuários
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── test/            # Testes
│   ├── .env             # Variáveis de ambiente (não commitado)
│   ├── .env.example     # Exemplo de variáveis
│   ├── Dockerfile       # Build do container
│   ├── package.json     # Dependências
│   └── tsconfig.json    # Configuração TypeScript
├── .editorconfig        # Configuração do editor
├── .gitignore          # Arquivos ignorados pelo Git
├── CONTRIBUTING.md      # Guia de contribuição
├── docker-compose.yml   # Orquestração de containers
├── LICENSE             # Licença do projeto
├── Makefile            # Comandos úteis
├── package.json        # Configuração do monorepo
├── README.md           # Documentação principal
└── start-project.sh    # Script de inicialização
```

## 🔧 Arquitetura do Backend

### Módulos Principais

#### 1. Auth (Autenticação)
- **Responsabilidade**: Gerenciar autenticação e autorização
- **Tecnologias**: JWT, Passport, bcrypt
- **Endpoints**: `/auth/login`, `/auth/register`

#### 2. User (Usuários)
- **Responsabilidade**: Gerenciar dados de usuários
- **Funcionalidades**: CRUD de usuários, perfis
- **Endpoints**: `/users/*`

#### 3. Product (Produtos)
- **Responsabilidade**: Catálogo de produtos
- **Funcionalidades**: CRUD de produtos, busca, filtros
- **Endpoints**: `/products/*`

#### 4. Order (Pedidos)
- **Responsabilidade**: Gerenciar pedidos
- **Funcionalidades**: Criação, status, histórico
- **Endpoints**: `/orders/*`

#### 5. Cart (Carrinho)
- **Responsabilidade**: Gerenciar carrinho de compras
- **Funcionalidades**: Adicionar, remover, atualizar itens
- **Endpoints**: `/cart/*`

#### 6. Report (Relatórios)
- **Responsabilidade**: Gerar relatórios de vendas
- **Funcionalidades**: CSV, storage em S3
- **Endpoints**: `/reports/*`

### Serviços de Infraestrutura

#### Prisma Service
- ORM para acesso ao banco de dados
- Migrations e seeding
- Type-safe queries

#### Redis Service
- Cache de dados
- Rate limiting
- Session storage

#### S3 Service
- Upload de arquivos
- Storage de relatórios
- Signed URLs

### Guards e Interceptors

#### Guards
- **JwtAuthGuard**: Valida tokens JWT
- **RolesGuard**: Controle de acesso baseado em roles
- **RateLimitGuard**: Limita requisições

#### Interceptors
- **ErrorInterceptor**: Tratamento global de erros
- **CacheInterceptor**: Cache de respostas
- **HttpMetricsInterceptor**: Coleta de métricas

## 🗄️ Banco de Dados

### Schema Principal

```
User
├── id
├── name
├── email
├── password
├── type (ADMIN, CLIENT)
└── relations: Client, permissions

Client
├── id
├── fullName
├── contact
├── address
└── relations: User, Orders, Cart

Product
├── id
├── name
├── description
├── price
├── stock
└── relations: Category, OrderItems, CartItems

Order
├── id
├── status (RECEIVED, IN_PREPARATION, DISPATCHED, DELIVERED, CANCELLED)
├── total
├── orderDate
└── relations: Client, OrderItems

Category
├── id
├── name
├── description
└── relations: Products
```

## 🔄 Fluxo de Requisição

```
1. Cliente faz requisição HTTP
   ↓
2. Rate Limit Guard verifica limite
   ↓
3. JWT Auth Guard valida token
   ↓
4. Roles Guard verifica permissões
   ↓
5. Cache Interceptor verifica cache
   ↓
6. Validation Pipe valida dados
   ↓
7. Controller processa requisição
   ↓
8. Service executa lógica de negócio
   ↓
9. Prisma acessa banco de dados
   ↓
10. Response é cacheado (se aplicável)
    ↓
11. Métricas são coletadas
    ↓
12. Response retorna ao cliente
```

## 🐳 Docker

### Serviços

1. **postgres**: Banco de dados PostgreSQL 16
2. **redis**: Cache e rate limiting
3. **server**: API NestJS

### Volumes

- `postgres_data`: Persistência do PostgreSQL
- `redis_data`: Persistência do Redis

### Networks

- `ecommerce_default`: Rede interna para comunicação entre containers

## 📦 Dependências Principais

### Backend
- **NestJS**: Framework Node.js
- **Prisma**: ORM
- **TypeScript**: Linguagem
- **JWT**: Autenticação
- **bcrypt**: Hash de senhas
- **class-validator**: Validação
- **Redis**: Cache
- **AWS SDK**: Integração S3
- **Swagger**: Documentação API

## 🔐 Segurança

### Camadas de Segurança

1. **Rate Limiting**: Previne ataques DDoS
2. **JWT**: Autenticação stateless
3. **bcrypt**: Hash de senhas
4. **Validation Pipes**: Validação de inputs
5. **CORS**: Controle de acesso
6. **Guards**: Autorização granular
7. **Helmet**: Headers de segurança (a implementar)

## 📊 Monitoramento

### Health Checks
- `/health`: Status geral da aplicação
- `/health/db`: Status do banco de dados
- `/health/redis`: Status do Redis

### Métricas
- `/metrics`: Métricas Prometheus
- Tempo de resposta de endpoints
- Uso de recursos

## 🧪 Testes

### Tipos de Testes

1. **Unit Tests**: Testes isolados de funções/classes
2. **Integration Tests**: Testes de integração entre módulos
3. **E2E Tests**: Testes de ponta a ponta

### Cobertura

Meta: > 80% de cobertura de código

## 🚀 Deploy

### Ambientes

1. **Development**: Ambiente local
2. **Staging**: Ambiente de homologação (a configurar)
3. **Production**: Ambiente de produção (a configurar)

### CI/CD

GitHub Actions configurado para:
- Testes automáticos
- Build do Docker
- Deploy (a configurar)

## 📝 Próximos Passos

1. [ ] Implementar frontend (client/)
2. [ ] Adicionar Helmet para segurança
3. [ ] Configurar ambiente de staging
4. [ ] Implementar deploy automático
5. [ ] Adicionar mais testes E2E
6. [ ] Implementar notificações (email, SMS)
7. [ ] Adicionar suporte a pagamentos (Stripe)
8. [ ] Implementar busca avançada (Elasticsearch)
