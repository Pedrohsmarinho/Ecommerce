#!/bin/bash

echo "🚀 Iniciando limpeza do projeto..."

# Remover diretórios vazios ou não utilizados
echo "📁 Removendo diretórios não utilizados..."
rm -rf src/models
rm -rf src/types/express
rm -rf src/services

# Mover DTOs para seus respectivos módulos
echo "📦 Movendo DTOs para seus módulos..."
mkdir -p src/auth/dto
mkdir -p src/user/dto

mv src/dtos/LoginRequestDTO.ts src/auth/dto/
mv src/dtos/RegisterRequestDTO.ts src/auth/dto/
mv src/dtos/TokenVerificationDTO.ts src/auth/dto/
mv src/dtos/EmailVerificationDTO.ts src/user/dto/
mv src/dtos/ResendVerificationDTO.ts src/user/dto/
mv src/dtos/CreateUserDTO.ts src/user/dto/

# Remover diretório dtos após mover os arquivos
rm -rf src/dtos

# Remover arquivos de configuração duplicados
echo "⚙️ Removendo arquivos de configuração duplicados..."
rm -f eslint.config.mjs

# Atualizar package.json para remover dependências não utilizadas
echo "📦 Atualizando package.json..."
npm uninstall express @types/express zod supertest @types/supertest jest @types/jest ts-jest

# Limpar cache e node_modules
echo "🧹 Limpando cache e node_modules..."
rm -rf node_modules
rm -rf dist
rm -f package-lock.json

# Reinstalar dependências
echo "📦 Reinstalando dependências..."
npm install

# Reconstruir o projeto
echo "🔨 Reconstruindo o projeto..."
npm run build

echo "✨ Limpeza concluída!" 