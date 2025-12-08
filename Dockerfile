# Imagem base leve com Node 20 (pedido em package.json: "node": ">=20")
FROM node:20-alpine

WORKDIR /app

# Copia apenas package*.json para aproveitar cache e instalar dependências
COPY package*.json ./

# Instala dependências de produção
RUN npm ci --production

# Copia o restante do projeto
COPY . .

# Porta que a aplicação deve escutar (a app deve ler process.env.PORT)
ENV PORT=8080
EXPOSE 8080

# Comando para iniciar sua API
CMD ["node", "api.js"]
