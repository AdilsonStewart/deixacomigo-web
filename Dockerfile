# Use Node.js 20 (versão estável)
FROM node:20-alpine

# Diretório da aplicação
WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências
RUN npm install

# Copiar todo o código da aplicação (incluindo api.js)
COPY . .

# Expor a porta 3000
EXPOSE 3000

# Comando para iniciar a aplicação (agora com a API)
CMD ["node", "api.js"]
