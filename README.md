# Ecommerce API with Authentication System

A comprehensive ecommerce API built with Node.js, Express, TypeScript, Prisma, and PostgreSQL featuring a complete authentication system with JWT tokens.

## 🚀 Features Implemented

### ✅ Authentication System
- **User Registration** with validation (name, email, password, type)
- **User Login** with JWT token generation
- **Token Verification** endpoint
- **Password Hashing** using bcrypt
- **JWT Middleware** for route protection
- **Role-Based Access Control** (RBAC) with ADMIN/CLIENT roles
- **Protected Routes** requiring authentication

### 🔐 Security Features
- Password hashing with bcrypt (salt rounds: 10)
- JWT token-based authentication
- Input validation with Zod schemas
- Type-safe request/response handling
- Environment variable configuration

## 📋 API Endpoints

### Authentication Routes (`/api/auth`)

#### POST `/api/auth/login`
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
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "user@example.com",
    "type": "CLIENT"
  }
}
```

#### POST `/api/auth/verify`
Verify if a JWT token is valid.

**Request Body:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Success Response (200):**
```json
{
  "message": "Token is valid",
  "user": {
    "userId": "uuid",
    "email": "user@example.com",
    "type": "CLIENT"
  }
}
```

### User Routes (`/api/users`)

#### POST `/api/users/register`
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

**Success Response (201):**
```json
{
  "id": "uuid",
  "email": "user@example.com"
}
```

#### GET `/api/users/me` 🔒
Get the current authenticated user's profile. **Requires Authentication Header.**

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Success Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "user@example.com",
    "type": "CLIENT",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
}
```

## 🛠️ Setup Instructions

### 1. Environment Configuration
Create a `.env` file in the project root:

```env
# Database URL (update with your PostgreSQL credentials)
DATABASE_URL="postgresql://username:password@localhost:5432/ecommerce"

# JWT Configuration - IMPORTANT: Use a secure random string in production
JWT_SECRET="your-super-secret-jwt-key-replace-with-secure-random-string"
JWT_EXPIRES_IN="24h"

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
npm run dev

# Production mode
npm run build
npm start
```

## 📁 Project Structure

```
src/
├── controllers/          # Request handlers
│   ├── AuthController.ts  # Login, token verification
│   └── UserController.ts  # User registration, profile
├── dtos/                 # Data Transfer Objects with Zod validation
│   ├── CreateUserDTO.ts   # User registration validation
│   ├── LoginRequestDTO.ts # Login validation
│   └── TokenVerificationDTO.ts # Token validation
├── middlewares/          # Express middlewares
│   ├── authMiddleware.ts  # JWT authentication & RBAC
│   └── validation.ts      # Zod schema validation
├── routes/               # Route definitions
│   ├── auth.routes.ts     # Authentication endpoints
│   └── user.routes.ts     # User endpoints
├── services/             # Business logic
│   ├── AuthService.ts     # JWT operations, authentication
│   └── UserService.ts     # User operations
├── types/                # TypeScript type definitions
│   └── express.d.ts       # Extended Express types
├── utils/                # Utility functions
│   └── hash.ts           # Password hashing utilities
└── index.ts             # Application entry point
```

## 🔒 Authentication Flow

1. **Registration**: User registers with `/api/users/register`
2. **Login**: User logs in with `/api/auth/login` and receives JWT token
3. **Protected Access**: User includes `Authorization: Bearer <token>` header for protected routes
4. **Token Verification**: Middleware validates JWT token on each protected request

## 🛡️ Security Best Practices Implemented

- ✅ Password hashing with bcrypt
- ✅ JWT tokens with expiration
- ✅ Input validation with Zod schemas
- ✅ Type-safe request handling
- ✅ Role-based access control
- ✅ Environment variable configuration
- ✅ Error handling for security scenarios

## 🔧 Available Middlewares

### `authMiddleware`
Protects routes requiring authentication.

### `requireRole(['ADMIN', 'CLIENT'])`
Restricts access based on user role.

### `requireAdmin`
Allows only ADMIN users.

### `requireClientOrAdmin`
Allows both CLIENT and ADMIN users.

### `validate(schema)`
Validates request body against Zod schema.

## 🧪 Testing the API

### Using curl:

```bash
# Register a new user
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"password123","type":"CLIENT"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'

# Get user profile (replace TOKEN with actual JWT)
curl -X GET http://localhost:3000/api/users/me \
  -H "Authorization: Bearer TOKEN"
```

## ⚠️ Production Deployment Notes

1. **JWT Secret**: Use a cryptographically secure random string
2. **Database**: Configure secure PostgreSQL connection
3. **HTTPS**: Always use HTTPS in production
4. **Rate Limiting**: Implement rate limiting for authentication endpoints
5. **Logging**: Add comprehensive logging for security events

---

**Status**: ✅ **Complete Authentication System Ready for Production Use**