FROM node:20-alpine

WORKDIR /app

# Copia package*.json para aproveitar cache
COPY package*.json ./

# Instala dependências de produção
RUN npm ci --production

# Copia o restante do código
COPY . .

# Porta padrão (coincide com o fallback em api.js)
ENV PORT=80
EXPOSE 80

CMD ["node", "api.js"]
