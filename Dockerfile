# Build do React
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Servir arquivos estáticos
FROM node:20-alpine

WORKDIR /app

# Instalar servidor estático
RUN npm install -g serve

# Copiar build do React
COPY --from=builder /app/build ./build

# Expor porta 3000
EXPOSE 3000

# Iniciar servidor
CMD ["serve", "-s", "build", "-l", "3000"]
