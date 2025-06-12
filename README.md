# Ecommerce API with Authentication System

A comprehensive ecommerce API built with NestJS, TypeScript, Prisma, and PostgreSQL featuring a complete authentication system with JWT tokens and granular permissions.

## 🚀 Features Implemented

### ✅ Authentication System
- **User Registration** with validation (name, email, password, type)
- **User Login** with JWT token generation
- **Token Verification** endpoint
- **Password Hashing** using bcrypt
- **JWT Guards** for route protection
- **Permission-Based Access Control** with granular permissions
- **Protected Routes** requiring authentication

### 🔐 Security Features
- Password hashing with bcrypt (salt rounds: 10)
- JWT token-based authentication
- Input validation with class-validator
- Type-safe request/response handling
- Environment variable configuration
- Granular permission system

## 📋 API Endpoints

### Authentication Routes (`/auth`)

#### POST `/auth/login`
Login with email and password to receive JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Success Response (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### User Routes (`/users`)

#### POST `/users/register`
Register a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "user@example.com",
  "password": "password123",
  "type": "CLIENT"
}
```

#### GET `/users/me` 🔒
Get the current authenticated user's profile.

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

### Product Routes (`/products`)

#### GET `/products` 🔒
Get all products. Requires `read:product` permission.

#### GET `/products/:id` 🔒
Get a specific product. Requires `read:product` permission.

#### POST `/products` 🔒
Create a new product. Requires `create:product` permission.

**Request Body:**
```json
{
  "name": "Product Name",
  "description": "Product Description",
  "price": 99.99,
  "stock": 10,
  "categoryId": "category-id"
}
```

#### PUT `/products/:id` 🔒
Update a product. Requires `update:product` permission.

#### DELETE `/products/:id` 🔒
Delete a product. Requires `delete:product` permission.

## 🛠️ Setup Instructions

### 1. Environment Configuration
Create a `.env` file in the project root:

```env
# Database URL (update with your PostgreSQL credentials)
DATABASE_URL="postgresql://username:password@localhost:5432/ecommerce"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-replace-with-secure-random-string"

# Server Configuration
PORT=3000
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Database Setup
```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# (Optional) Seed the database
npx prisma db seed
```

### 4. Start the Server
```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

## 📁 Project Structure

```
src/
├── auth/                 # Authentication module
│   ├── decorators/       # Custom decorators
│   ├── guards/          # Authentication guards
│   ├── strategies/      # Passport strategies
│   └── auth.module.ts   # Auth module definition
├── product/             # Product module
│   ├── product.controller.ts
│   ├── product.service.ts
│   └── product.module.ts
├── user/                # User module
│   ├── user.controller.ts
│   ├── user.service.ts
│   └── user.module.ts
├── prisma/              # Database configuration
│   └── prisma.service.ts
├── dtos/                # Data Transfer Objects
└── main.ts             # Application entry point
```

## 🔒 Permission System

The API uses a granular permission system with the following permissions:

### Product Permissions
- `create:product` - Create new products
- `read:product` - View products
- `update:product` - Update existing products
- `delete:product` - Delete products

### User Permissions
- `manage:users` - Manage user accounts

### Order Permissions
- `manage:orders` - Manage orders
- `view:orders` - View orders

### Category Permissions
- `manage:categories` - Manage product categories

### Role-Based Permissions
- **ADMIN**: Has all permissions
- **CLIENT**: Has limited permissions (read:product, view:orders)

## 🧪 Testing the API

### Using curl:

```bash
# Register a new user
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"password123","type":"CLIENT"}'

# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'

# Create a product (requires admin token)
curl -X POST http://localhost:3000/products \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Product",
    "description": "Test Description",
    "price": 99.99,
    "stock": 10,
    "categoryId": "category-id"
  }'

# Get all products
curl -X GET http://localhost:3000/products \
  -H "Authorization: Bearer TOKEN"
```

## ⚠️ Production Deployment Notes

1. **JWT Secret**: Use a cryptographically secure random string
2. **Database**: Configure secure PostgreSQL connection
3. **HTTPS**: Always use HTTPS in production
4. **Rate Limiting**: Implement rate limiting for authentication endpoints
5. **Logging**: Add comprehensive logging for security events
6. **CORS**: Configure CORS properly for your frontend
7. **Environment Variables**: Use proper environment variable management

---

**Status**: ✅ **Complete Authentication System Ready for Production Use**

## Rotas da API

### Autenticação (`/auth`)
- `POST /auth/login` - Login de usuário
- `POST /auth/register` - Registro de novo usuário

### Usuários (`/users`)
- `GET /users/me` - Obter perfil do usuário logado (requer autenticação)
- `POST /users/verify-email` - Verificar email do usuário
- `POST /users/resend-verification` - Reenviar email de verificação
- `GET /users` - Listar todos os usuários (requer autenticação e role ADMIN)
- `GET /users/:id` - Obter usuário por ID (requer autenticação e role ADMIN)

## Documentação
A documentação completa da API está disponível em `/api` quando o servidor estiver rodando.

## Autenticação
Todas as rotas protegidas requerem um token JWT no header:
```
Authorization: Bearer <seu-token>
```

## Roles
- `ADMIN`: Acesso total ao sistema
- `CLIENT`: Acesso limitado às próprias informações