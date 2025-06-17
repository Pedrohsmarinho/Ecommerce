
# Build stage
FROM node:20.17 AS builder

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências (incluindo devDependencies para build)
RUN npm ci

# Copiar código fonte
COPY . .

# Criar arquivo nest-cli.json se não existir
RUN echo '{\
  "$schema": "https://json.schemastore.org/nest-cli",\
  "collection": "@nestjs/schematics",\
  "sourceRoot": "src",\
  "compilerOptions": {\
  "deleteOutDir": true\
  }\
  }' > nest-cli.json

# Build da aplicação
RUN npm run build

# Verificar se o build foi bem-sucedido
RUN echo "=== Verificando arquivos após build ===" && \
  ls -la dist/ && \
  echo "=== Arquivos JavaScript gerados ===" && \
  find dist/ -name "*.js" -type f && \
  echo "=== Verificando main.js ===" && \
  test -f dist/main.js && echo "✓ main.js encontrado" || echo "✗ main.js NÃO encontrado"

# ==============================================================================
# Production stage
FROM node:20.17-slim AS production

# Instalar wget para healthcheck
RUN apt-get update && \
  apt-get install -y wget && \
  apt-get clean && \
  rm -rf /var/lib/apt/lists/*

# Criar usuário não-root para segurança
RUN groupadd -r nodejs && useradd -r -g nodejs nodejs

# Definir diretório de trabalho
WORKDIR /app

# Copiar apenas arquivos necessários para produção
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --chown=nodejs:nodejs package*.json ./

# Criar diretório de logs se necessário
RUN mkdir -p logs && chown nodejs:nodejs logs

# Mudar para usuário não-root
USER nodejs

# Expor porta da aplicação
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Comando para iniciar a aplicação
CMD ["node", "dist/src/main.js"]

# ==============================================================================
# PARA DESENVOLVIMENTO - Uncomment se precisar
# ==============================================================================
# FROM node:20.17 AS development
# WORKDIR /app
# COPY package*.json ./
# RUN npm ci
# COPY . .
# EXPOSE 3000
# CMD ["npm", "run", "start:dev"]