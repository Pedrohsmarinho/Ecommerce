# Use uma imagem oficial do Node.js como base
FROM node:20.17

# Crie e defina o diretório de trabalho
WORKDIR /app

# Copie os arquivos de dependências
COPY package*.json ./

# Instale as dependências
RUN npm install

# Instale o cliente Redis
RUN apk add --no-cache redis

# Copie o restante da aplicação
COPY . .

# Construa a aplicação
RUN npm run build

# Exponha a porta que a aplicação vai usar
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Comando para iniciar a aplicação em modo prod
CMD ["npm", "run", "start:prod"]