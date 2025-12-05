# Build do React
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Servidor Node.js com API + React
FROM node:20-alpine

WORKDIR /app

# Copiar package.json e instalar SOMENTE dependências de produção
COPY package*.json ./
RUN npm install --only=production

# Copiar build do React
COPY --from=builder /app/build ./build

# Copiar API
COPY api.js ./

# Expor porta 8080 (Fly.io usa esta porta)
EXPOSE 8080

# Iniciar servidor
CMD ["node", "api.js"]
