#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}1. Registrando um novo usuário...${NC}"
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@example.com",
    "password": "senha123",
    "name": "Usuário Teste",
    "type": "CLIENT"
  }'

echo -e "\n\n${BLUE}2. Fazendo login...${NC}"
LOGIN_RESPONSE=$(curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@example.com",
    "password": "senha123"
  }')

echo $LOGIN_RESPONSE

# Extract tokens from response
ACCESS_TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)
REFRESH_TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"refresh_token":"[^"]*' | cut -d'"' -f4)

echo -e "\n\n${BLUE}3. Testando rota protegida com token de acesso...${NC}"
curl -X GET http://localhost:3000/auth/profile \
  -H "Authorization: Bearer $ACCESS_TOKEN"

echo -e "\n\n${BLUE}4. Renovando o token...${NC}"
curl -X POST http://localhost:3000/auth/refresh \
  -H "Content-Type: application/json" \
  -d "{
    \"refreshToken\": \"$REFRESH_TOKEN\"
  }"

echo -e "\n\n${BLUE}5. Fazendo logout...${NC}"
curl -X POST http://localhost:3000/auth/logout \
  -H "Authorization: Bearer $ACCESS_TOKEN"

echo -e "\n\n${GREEN}Testes completos!${NC}" 