# Use uma imagem oficial do Node.js como base
FROM node:20.17

# Crie e defina o diretório de trabalho
WORKDIR /app

# Copie os arquivos de dependências
COPY package*.json ./

# Instale as dependências
RUN npm install

# Copie o restante da aplicação
COPY . .

# Exponha a porta que a aplicação vai usar
EXPOSE 3000

# Comando para iniciar a aplicação em modo dev
CMD ["npx", "ts-node-dev", "--respawn", "--transpile-only", "src/index.ts"]