#!/bin/bash

echo "🚀 Iniciando projeto E-commerce..."
echo ""

# Verificar se Docker está rodando
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker não está rodando. Por favor, inicie o Docker Desktop primeiro."
    exit 1
fi

echo "✅ Docker está rodando"
echo ""

# Subir containers
echo "📦 Subindo containers (PostgreSQL e Redis)..."
docker compose up -d

# Aguardar PostgreSQL estar pronto
echo ""
echo "⏳ Aguardando PostgreSQL ficar pronto..."
sleep 5

# Gerar Prisma Client
echo ""
echo "🔧 Gerando Prisma Client..."
npx prisma generate

# Executar migrations
echo ""
echo "📊 Executando migrations do banco de dados..."
npx prisma migrate deploy

# Executar seed (opcional)
echo ""
read -p "Deseja popular o banco com dados de teste? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🌱 Populando banco de dados..."
    npx prisma db seed
fi

# Iniciar aplicação
echo ""
echo "🎯 Iniciando aplicação NestJS..."
echo ""
# npm run start:dev

