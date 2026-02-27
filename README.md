# E-commerce Monorepo

Projeto de E-commerce organizado em monorepo com backend (NestJS) e frontend separados.

## 📁 Estrutura do Projeto

```
Ecommerce/
├── server/          # Backend API (NestJS + TypeScript)
│   ├── src/         # Código fonte
│   ├── prisma/      # Schema e migrations do banco
│   ├── test/        # Testes
│   └── ...
├── client/          # Frontend (a ser implementado)
├── docs/            # Documentação
├── docker-compose.yml
└── README.md
```

## 🚀 Quick Start

### Usando Docker (Recomendado)

```bash
# Subir todos os serviços (PostgreSQL, Redis, Backend)
docker compose up -d

# Ver logs
docker compose logs -f server

# Parar serviços
docker compose down
```

### Desenvolvimento Local

#### Backend (Server)

```bash
cd server

# Instalar dependências
npm install

# Gerar Prisma Client
npx prisma generate

# Executar migrations
npx prisma migrate dev

# Iniciar em modo desenvolvimento
npm run start:dev
```

## 🔧 Configuração

### Variáveis de Ambiente

Copie o arquivo `.env.example` para `.env` no diretório `server/`:

```bash
cp server/.env.example server/.env
```

Configure as variáveis de acordo com seu ambiente.

### Portas

- **Backend API**: `http://localhost:3000`
- **Swagger Docs**: `http://localhost:3000/api`
- **PostgreSQL**: `localhost:5433`
- **Redis**: `localhost:6380`

## 📚 Documentação

- [Backend README](./server/README.md) - Documentação completa da API
- [Documentação de Validação](./docs/VALIDATION.md)
- [Melhorias Implementadas](./docs/MELHORIAS-IMPLEMENTADAS.md)
- [Arquitetura](./docs/ARCHITECTURE.md)

## 🛠️ Tecnologias

### Backend
- **Framework**: NestJS
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Cache**: Redis
- **Auth**: JWT
- **Storage**: AWS S3
- **Testing**: Jest
- **Documentation**: Swagger/OpenAPI

## 🧪 Testes

```bash
cd server

# Testes unitários
npm run test

# Testes e2e
npm run test:e2e

# Cobertura
npm run test:cov
```

## 📦 Scripts Úteis

```bash
# Build do backend
cd server && npm run build

# Linting
cd server && npm run lint

# Formatar código
cd server && npm run format

# Migrations do banco
cd server && npx prisma migrate dev

# Visualizar banco de dados
cd server && npx prisma studio
```

## 🐳 Docker

O projeto usa Docker Compose com os seguintes serviços:

- **postgres**: PostgreSQL 16 Alpine
- **redis**: Redis Alpine
- **server**: Backend NestJS

## 📝 Licença

ISC

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/amazing-feature`)
3. Commit suas mudanças (`git commit -m 'Add amazing feature'`)
4. Push para a branch (`git push origin feature/amazing-feature`)
5. Abra um Pull Request
