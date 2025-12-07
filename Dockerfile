# Estágio de build (se necessário)
FROM node:20 AS builder

WORKDIR /app

# Copia os arquivos de dependência
COPY package*.json ./

# Instala as dependências
RUN npm install --only=production

# Copia o código da aplicação
COPY . .

# Estágio de produção
FROM node:20-slim

WORKDIR /app

# Copia as dependências do estágio de build
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app .

# Expõe a porta que a API vai rodar
EXPOSE 8080

# Comando para iniciar a API
CMD [ "node", "api.js" ]
