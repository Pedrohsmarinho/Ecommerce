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

### 📊 Report Generation with S3 Integration
- **Sales Reports** generation in CSV format
- **AWS S3 Integration** for file storage
- **Signed URLs** for secure file access
- **Report Metadata** storage in database
- **Filtering Options** by date range, product name, and client type
- **Automatic Cleanup** of temporary files

### 🚀 Performance & Caching
- **Redis Integration** for caching
- **Health Checks** with @nestjs/terminus
- **Metrics Collection** with prom-client
- **Rate Limiting** for API endpoints

## 🛠️ Tech Stack

- **Framework:** NestJS
- **Language:** TypeScript
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Cache:** Redis
- **Authentication:** JWT, Passport
- **Storage:** AWS S3
- **Testing:** Jest
- **Documentation:** Swagger/OpenAPI
- **Containerization:** Docker

## 📋 Prerequisites

- Node.js (version specified in .nvmrc)
- Docker and Docker Compose
- PostgreSQL
- Redis
- AWS Account (for S3 integration)

## 🚀 Getting Started

1. **Clone the repository**
```bash
git clone <repository-url>
cd ecommerce
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Setup**
Create a `.env` file in the root directory with the following variables:
```env
# Database
POSTGRES_USER=your_user
POSTGRES_PASSWORD=your_password
POSTGRES_DB=ecommerce

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRATION=1d

# AWS S3
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=your_region
AWS_BUCKET_NAME=your_bucket

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
```

4. **Database Setup**
```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed the database (optional)
npm run prisma:seed
```

5. **Development**
```bash
# Start development server
npm run start:dev

# Run tests
npm run test

# Run tests with coverage
npm run test:cov
```

## 🐳 Docker Deployment

1. **Build and run with Docker Compose**
```bash
docker-compose up --build
```

2. **Access the application**
- API: http://localhost:3000
- Swagger Documentation: http://localhost:3000/api

## 📚 API Documentation

The API documentation is available through Swagger UI at `/api` endpoint when the application is running.

## 🧪 Testing

```bash
# Unit tests
npm run test

# e2e tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 📦 Available Scripts

- `npm run build` - Build the application
- `npm run start` - Start the application
- `npm run start:dev` - Start the application in development mode
- `npm run start:debug` - Start the application in debug mode
- `npm run start:prod` - Start the application in production mode
- `npm run lint` - Lint the code
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:cov` - Run tests with coverage
- `npm run test:debug` - Run tests in debug mode
- `npm run test:e2e` - Run end-to-end tests
- `npm run prisma:seed` - Seed the database

## 🔄 CI/CD

The project includes GitHub Actions workflows for:
- Automated testing
- Code quality checks
- Docker image building
- Deployment

## 📝 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 🚀 API Endpoints

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

### Order Routes (`/orders`)

#### POST `/orders` 🔒
Create a new order. Requires ADMIN role.

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Request Body:**
```json
{
  "clientId": "123e4567-e89b-12d3-a456-426614174000",
  "items": [
    {
      "productId": "123e4567-e89b-12d3-a456-426614174001",
      "quantity": 2
    },
    {
      "productId": "123e4567-e89b-12d3-a456-426614174002",
      "quantity": 1
    }
  ]
}
```

**Success Response (201):**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174003",
  "clientId": "123e4567-e89b-12d3-a456-426614174000",
  "status": "RECEIVED",
  "orderDate": "2024-03-20T10:00:00.000Z",
  "total": "150.00",
  "items": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174004",
      "quantity": 2,
      "unitPrice": "50.00",
      "subtotal": "100.00",
      "product": {
        "id": "123e4567-e89b-12d3-a456-426614174001",
        "name": "Product 1",
        "description": "Description 1",
        "price": "50.00",
        "stock": 8
      }
    },
    {
      "id": "123e4567-e89b-12d3-a456-426614174005",
      "quantity": 1,
      "unitPrice": "50.00",
      "subtotal": "50.00",
      "product": {
        "id": "123e4567-e89b-12d3-a456-426614174002",
        "name": "Product 2",
        "description": "Description 2",
        "price": "50.00",
        "stock": 9
      }
    }
  ],
  "client": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "fullName": "John Doe",
    "contact": "11999999999",
    "address": "Rua Exemplo, 123",
    "user": {
      "id": "123e4567-e89b-12d3-a456-426614174006",
      "name": "John Doe",
      "email": "john@example.com",
      "type": "CLIENT"
    }
  }
}
```

**Error Responses:**
- 400 Bad Request: Invalid input or insufficient stock
- 404 Not Found: Client or product not found
- 401 Unauthorized: Invalid or missing token
- 403 Forbidden: User is not an admin

#### GET `/orders` 🔒
Get all orders. Requires ADMIN role.

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Success Response (200):**
```json
[
  {
    "id": "order-uuid",
    "clientId": "client-uuid",
    "status": "IN_PREPARATION",
    "orderDate": "2024-03-20T10:00:00.000Z",
    "total": "150.00",
    "created_at": "2024-03-20T10:00:00.000Z",
    "updated_at": "2024-03-20T10:00:00.000Z",
    "items": [
      {
        "id": "item-uuid",
        "quantity": 2,
        "unitPrice": "50.00",
        "subtotal": "100.00",
        "product": {
          "id": "product-uuid",
          "name": "Product Name",
          "description": "Product Description",
          "price": "50.00",
          "stock": 8
        }
      }
    ],
    "client": {
      "id": "client-uuid",
      "fullName": "John Doe",
      "contact": "11999999999",
      "address": "Rua Exemplo, 123",
      "user": {
        "id": "user-uuid",
        "name": "John Doe",
        "email": "john@example.com",
        "type": "CLIENT"
      }
    }
  }
]
```

#### GET `/orders/:id` 🔒
Get a specific order. Requires ADMIN role.

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Success Response (200):**
```json
{
  "id": "order-uuid",
  "clientId": "client-uuid",
  "status": "IN_PREPARATION",
  "orderDate": "2024-03-20T10:00:00.000Z",
  "total": "150.00",
  "created_at": "2024-03-20T10:00:00.000Z",
  "updated_at": "2024-03-20T10:00:00.000Z",
  "items": [
    {
      "id": "item-uuid",
      "quantity": 2,
      "unitPrice": "50.00",
      "subtotal": "100.00",
      "product": {
        "id": "product-uuid",
        "name": "Product Name",
        "description": "Product Description",
        "price": "50.00",
        "stock": 8
      }
    }
  ],
  "client": {
    "id": "client-uuid",
    "fullName": "John Doe",
    "contact": "11999999999",
    "address": "Rua Exemplo, 123",
    "user": {
      "id": "user-uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "type": "CLIENT"
    }
  }
}
```

### Order Status Management

The system implements a state machine for order status with the following flow:

```
RECEIVED → IN_PREPARATION → DISPATCHED → DELIVERED
     ↓           ↓              ↓
     └───────────┴──────────────┘
            CANCELLED
```

#### POST `/orders/:id/confirm` 🔒
Confirm an order and start preparation. Changes status from RECEIVED to IN_PREPARATION.

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Success Response (200):**
```json
{
  "id": "order-uuid",
  "status": "IN_PREPARATION",
  "orderDate": "2024-03-20T10:00:00.000Z",
  "total": "150.00",
  "updated_at": "2024-03-20T10:00:00.000Z"
}
```

#### POST `/orders/:id/dispatch` 🔒
Mark order as dispatched. Changes status from IN_PREPARATION to DISPATCHED.

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Success Response (200):**
```json
{
  "id": "order-uuid",
  "status": "DISPATCHED",
  "orderDate": "2024-03-20T10:00:00.000Z",
  "total": "150.00",
  "updated_at": "2024-03-20T10:00:00.000Z"
}
```

#### POST `/orders/:id/deliver` 🔒
Mark order as delivered. Changes status from DISPATCHED to DELIVERED.

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Success Response (200):**
```json
{
  "id": "order-uuid",
  "status": "DELIVERED",
  "orderDate": "2024-03-20T10:00:00.000Z",
  "total": "150.00",
  "updated_at": "2024-03-20T10:00:00.000Z"
}
```

#### POST `/orders/:id/cancel` 🔒
Cancel an order and restore stock. Can be called from RECEIVED, IN_PREPARATION, or DISPATCHED status.

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Success Response (200):**
```json
{
  "id": "order-uuid",
  "status": "CANCELLED",
  "orderDate": "2024-03-20T10:00:00.000Z",
  "total": "150.00",
  "updated_at": "2024-03-20T10:00:00.000Z"
}
```

**Error Responses for all status endpoints:**
- 404 Not Found: Order not found
- 400 Bad Request: Invalid status transition
- 401 Unauthorized: Invalid or missing token
- 403 Forbidden: User is not an admin

### Payment Confirmation

#### POST `/orders/:id/payment` 🔒
Confirm or decline payment for an order. This endpoint will:
- If payment is confirmed: Reduce stock and update order status to IN_PREPARATION
- If payment is declined: Update order status to CANCELLED

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Request Body:**
```json
{
  "status": "CONFIRMED"  // or "DECLINED"
}
```

**Success Response (200) - Payment Confirmed:**
```json
{
  "id": "order-uuid",
  "status": "IN_PREPARATION",
  "orderDate": "2024-03-20T10:00:00.000Z",
  "total": "150.00",
  "items": [
    {
      "id": "item-uuid",
      "productId": "product-uuid",
      "quantity": 2,
      "unitPrice": "75.00",
      "subtotal": "150.00",
      "product": {
        "id": "product-uuid",
        "name": "Product Name",
        "price": "75.00",
        "stock": 8  // Stock reduced by 2
      }
    }
  ],
  "client": {
    "id": "client-uuid",
    "fullName": "John Doe",
    "user": {
      "id": "user-uuid",
      "email": "john@example.com"
    }
  }
}
```

**Success Response (200) - Payment Declined:**
```json
{
  "id": "order-uuid",
  "status": "CANCELLED",
  "orderDate": "2024-03-20T10:00:00.000Z",
  "total": "150.00",
  "items": [
    {
      "id": "item-uuid",
      "productId": "product-uuid",
      "quantity": 2,
      "unitPrice": "75.00",
      "subtotal": "150.00",
      "product": {
        "id": "product-uuid",
        "name": "Product Name",
        "price": "75.00",
        "stock": 10  // Stock remains unchanged
      }
    }
  ],
  "client": {
    "id": "client-uuid",
    "fullName": "John Doe",
    "user": {
      "id": "user-uuid",
      "email": "john@example.com"
    }
  }
}
```

**Error Responses:**
- 404 Not Found: Order not found
- 400 Bad Request: Order is not in RECEIVED status
- 401 Unauthorized: Invalid or missing token
- 403 Forbidden: User is not an admin

### Usage Example with cURL

1. Confirm payment:
```bash
curl -X POST http://localhost:3000/orders/order-uuid/payment \
  -H "Authorization: Bearer your-jwt-token" \
  -H "Content-Type: application/json" \
  -d '{"status": "CONFIRMED"}'
```

2. Decline payment:
```bash
curl -X POST http://localhost:3000/orders/order-uuid/payment \
  -H "Authorization: Bearer your-jwt-token" \
  -H "Content-Type: application/json" \
  -d '{"status": "DECLINED"}'
```

### Usage Example with JavaScript/TypeScript

```typescript
// HTTP client configuration
const API_URL = 'http://localhost:3000';
let token = '';

// Function to confirm or decline payment
async function processPayment(orderId: string, status: 'CONFIRMED' | 'DECLINED') {
  const response = await fetch(`${API_URL}/orders/${orderId}/payment`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status }),
  });
  return response.json();
}

// Usage example
async function paymentExample() {
  try {
    // 1. Confirm payment
    const confirmedOrder = await processPayment('order-uuid', 'CONFIRMED');
    console.log('Payment confirmed:', confirmedOrder);

    // 2. Decline payment
    const declinedOrder = await processPayment('order-uuid', 'DECLINED');
    console.log('Payment declined:', declinedOrder);

  } catch (error) {
    console.error('Error:', error);
  }
}
```

### Cart Endpoints

The shopping cart system allows clients to manage their shopping cart items. All endpoints require authentication and client role.

#### POST `/cart` 🔒
Add an item to the cart.

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Request Body:**
```json
{
  "productId": "123e4567-e89b-12d3-a456-426614174000",
  "quantity": 2
}
```

**Success Response (201):**
```json
{
  "id": "cart-item-uuid",
  "clientId": "client-uuid",
  "productId": "product-uuid",
  "quantity": 2,
  "product": {
    "id": "product-uuid",
    "name": "Product Name",
    "price": "99.99",
    "stock": 10
  },
  "created_at": "2024-03-20T10:00:00.000Z",
  "updated_at": "2024-03-20T10:00:00.000Z"
}
```

#### PUT `/cart/:id` 🔒
Update cart item quantity.

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Request Body:**
```json
{
  "quantity": 3
}
```

**Success Response (200):**
```json
{
  "id": "cart-item-uuid",
  "clientId": "client-uuid",
  "productId": "product-uuid",
  "quantity": 3,
  "product": {
    "id": "product-uuid",
    "name": "Product Name",
    "price": "99.99",
    "stock": 10
  },
  "created_at": "2024-03-20T10:00:00.000Z",
  "updated_at": "2024-03-20T10:00:00.000Z"
}
```

#### DELETE `/cart/:id` 🔒
Remove an item from the cart.

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Success Response (200):**
```json
{
  "id": "cart-item-uuid",
  "clientId": "client-uuid",
  "productId": "product-uuid",
  "quantity": 2,
  "created_at": "2024-03-20T10:00:00.000Z",
  "updated_at": "2024-03-20T10:00:00.000Z"
}
```

#### GET `/cart` 🔒
Get cart contents.

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Success Response (200):**
```json
[
  {
    "id": "cart-item-uuid",
    "clientId": "client-uuid",
    "productId": "product-uuid",
    "quantity": 2,
    "product": {
      "id": "product-uuid",
      "name": "Product Name",
      "price": "99.99",
      "stock": 10
    },
    "created_at": "2024-03-20T10:00:00.000Z",
    "updated_at": "2024-03-20T10:00:00.000Z"
  }
]
```

#### GET `/cart/total` 🔒
Get cart total.

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Success Response (200):**
```json
{
  "total": "199.98"
}
```

#### DELETE `/cart` 🔒
Clear cart.

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Success Response (200):**
```json
{
  "count": 1
}
```

### Reports (`/reports`)

#### POST `/reports` 🔒
Generate a new sales report with detailed product sales data. The report will be saved in S3 and its metadata will be stored in the database.

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Request Body:**
```json
{
  "startDate": "2024-01-01",
  "endDate": "2024-03-20",
  "productName": "Optional product name filter",
  "clientType": "Optional client type filter"
}
```

**Success Response (201):**
```json
{
  "report": {
    "id": "report-uuid",
    "createdAt": "2024-03-20T10:00:00.000Z",
    "startDate": "2024-01-01T00:00:00.000Z",
    "endDate": "2024-03-20T23:59:59.999Z",
    "fileName": "sales_report_1234567890.csv",
    "filePath": "reports/sales_report_1234567890.csv",
    "totalSales": "15000.00",
    "totalOrders": 150,
    "filters": {
      "startDate": "2024-01-01",
      "endDate": "2024-03-20",
      "productName": "Optional product name filter",
      "clientType": "Optional client type filter"
    }
  },
  "summary": {
    "totalOrders": 150,
    "totalRevenue": "15000.00",
    "productCount": 25
  },
  "fileUrl": "https://your-bucket.s3.amazonaws.com/reports/sales_report_1234567890.csv?X-Amz-Algorithm=..."
}
```

#### GET `/reports` 🔒
List all generated reports with their signed URLs.

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Success Response (200):**
```json
[
  {
    "id": "report-uuid",
    "createdAt": "2024-03-20T10:00:00.000Z",
    "startDate": "2024-01-01T00:00:00.000Z",
    "endDate": "2024-03-20T23:59:59.999Z",
    "fileName": "sales_report_1234567890.csv",
    "filePath": "reports/sales_report_1234567890.csv",
    "totalSales": "15000.00",
    "totalOrders": 150,
    "filters": {
      "startDate": "2024-01-01",
      "endDate": "2024-03-20"
    },
    "fileUrl": "https://your-bucket.s3.amazonaws.com/reports/sales_report_1234567890.csv?X-Amz-Algorithm=..."
  }
]
```

#### GET `/reports/:id` 🔒
Get details of a specific report with a fresh signed URL.

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Success Response (200):**
```json
{
  "id": "report-uuid",
  "createdAt": "2024-03-20T10:00:00.000Z",
  "startDate": "2024-01-01T00:00:00.000Z",
  "endDate": "2024-03-20T23:59:59.999Z",
  "fileName": "sales_report_1234567890.csv",
  "filePath": "reports/sales_report_1234567890.csv",
  "totalSales": "15000.00",
  "totalOrders": 150,
  "filters": {
    "startDate": "2024-01-01",
    "endDate": "2024-03-20"
  },
  "fileUrl": "https://your-bucket.s3.amazonaws.com/reports/sales_report_1234567890.csv?X-Amz-Algorithm=..."
}
```

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

# AWS S3 Configuration
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="your-access-key-id"
AWS_SECRET_ACCESS_KEY="your-secret-access-key"
AWS_S3_BUCKET="your-bucket-name"
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
```

### 4. AWS S3 Setup
1. Create an AWS account if you don't have one
2. Create an S3 bucket for storing reports
3. Create an IAM user with S3 access
4. Get the access key ID and secret access key
5. Update the `.env` file with your AWS credentials

### 5. Start the Application
```bash
# Development
npm run start:dev

# Production
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

## API Routes

### Authentication (`/auth`)
- `POST /auth/login` - User login
- `POST /auth/register` - New user registration

### Users (`/users`)
- `GET /users/me` - Get logged user profile (requires authentication)
- `POST /users/verify-email` - Verify user email
- `POST /users/resend-verification` - Resend verification email
- `GET /users` - List all users (requires authentication and ADMIN role)
- `GET /users/:id` - Get user by ID (requires authentication and ADMIN role)

### Products (`/products`)
- `GET /products` - List all products
- `GET /products/:id` - Get product by ID
- `POST /products` - Create new product (requires authentication and ADMIN role)
- `PUT /products/:id` - Update product (requires authentication and ADMIN role)
- `DELETE /products/:id` - Delete product (requires authentication and ADMIN role)

### Orders (`/orders`)
- `GET /orders` - List all orders (requires authentication)
- `GET /orders/:id` - Get order by ID (requires authentication)
- `POST /orders` - Create new order (requires authentication)
- `PUT /orders/:id` - Update order status (requires authentication and ADMIN role)

### Cart (`/cart`)
- `GET /cart` - Get cart contents (requires authentication)
- `POST /cart` - Add item to cart (requires authentication)
- `PUT /cart/:id` - Update cart item quantity (requires authentication)
- `DELETE /cart/:id` - Remove item from cart (requires authentication)
- `DELETE /cart` - Clear cart (requires authentication)

### Reports (`/reports`)
- `GET /reports` - List all reports (requires authentication and ADMIN role)
- `GET /reports/:id` - Get report by ID (requires authentication and ADMIN role)
- `POST /reports` - Generate new report (requires authentication and ADMIN role)

## Documentation

### Authentication (`/auth`)
- `POST /auth/login` - User login
- `POST /auth/register` - New user registration

### Users (`/users`)
- `GET /users/me` - Get logged user profile (requires authentication)
- `POST /users/verify-email` - Verify user email
- `POST /users/resend-verification` - Resend verification email
- `GET /users` - List all users (requires authentication and ADMIN role)
- `GET /users/:id` - Get user by ID (requires authentication and ADMIN role)

### Products (`/products`)
- `GET /products` - List all products
- `GET /products/:id` - Get product by ID
- `POST /products` - Create new product (requires authentication and ADMIN role)
- `PUT /products/:id` - Update product (requires authentication and ADMIN role)
- `DELETE /products/:id` - Delete product (requires authentication and ADMIN role)

### Orders (`/orders`)
- `GET /orders` - List all orders (requires authentication)
- `GET /orders/:id` - Get order by ID (requires authentication)
- `POST /orders` - Create new order (requires authentication)
- `PUT /orders/:id` - Update order status (requires authentication and ADMIN role)

### Cart (`/cart`)
- `GET /cart` - Get cart contents (requires authentication)
- `POST /cart` - Add item to cart (requires authentication)
- `PUT /cart/:id` - Update cart item quantity (requires authentication)
- `DELETE /cart/:id` - Remove item from cart (requires authentication)
- `DELETE /cart` - Clear cart (requires authentication)

### Reports (`/reports`)
- `GET /reports` - List all reports (requires authentication and ADMIN role)
- `GET /reports/:id` - Get report by ID (requires authentication and ADMIN role)
- `POST /reports` - Generate new report (requires authentication and ADMIN role)

## Authentication

The API uses JWT (JSON Web Token) for authentication. To access protected endpoints, you need to:

1. Register a new user or login with existing credentials
2. Get the JWT token from the response
3. Include the token in the Authorization header for subsequent requests

### Example:

```bash
# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123"}'

# Use the token
curl -X GET http://localhost:3000/users/me \
  -H "Authorization: Bearer your-jwt-token"
```

## Error Handling

The API uses standard HTTP status codes and returns error messages in the following format:

```json
{
  "statusCode": 400,
  "message": "Error message",
  "error": "Bad Request"
}
```

Common error codes:
- 400: Bad Request - Invalid input data
- 401: Unauthorized - Missing or invalid authentication
- 403: Forbidden - Insufficient permissions
- 404: Not Found - Resource not found
- 500: Internal Server Error - Server-side error

## Rate Limiting

The API implements rate limiting to prevent abuse. The current limits are:
- 100 requests per minute for authenticated users
- 20 requests per minute for unauthenticated users

## CORS

The API is configured to accept requests from the following origins:
- http://localhost:3000
- http://localhost:3001
- https://your-production-domain.com

## Security

The API implements several security measures:
- Password hashing with bcrypt
- JWT token-based authentication
- Rate limiting
- CORS protection
- Input validation
- SQL injection prevention
- XSS protection

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.