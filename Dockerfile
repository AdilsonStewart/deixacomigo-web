# Stage 1: build frontend
FROM node:20-alpine AS builder
WORKDIR /app

# Copia package.json e package-lock.json e instala dependências
COPY package.json package-lock.json ./
RUN npm ci

# Copia todo o código e gera o build do frontend
COPY . .
RUN npm run build

# Stage 2: imagem final com a API e o build já copiado
FROM node:20-alpine
WORKDIR /app

# Instala apenas dependências de produção
COPY package.json package-lock.json ./
RUN npm ci --only=production

# Copia o build gerado
COPY --from=builder /app/build ./build

# Copia o restante do código
COPY . .

ENV NODE_ENV=production
EXPOSE 8080

CMD ["node", "api.js"]
