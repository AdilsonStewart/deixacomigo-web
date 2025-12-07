# Stage 1: build do frontend/backend
FROM node:18 AS builder
WORKDIR /app

# Instala dependências
COPY package*.json ./
RUN npm ci

# Copia o projeto e roda o build (CRA -> /build, Vite -> /dist)
COPY . .
RUN npm run build || true

# Stage 2: imagem final que executa a API e coloca os estáticos em /usr/share/nginx/html
FROM node:18-alpine
WORKDIR /app

# Copia artefatos e node_modules do builder
COPY --from=builder /app ./

# Garante a pasta que o fly.toml espera para [[statics]]
RUN mkdir -p /usr/share/nginx/html

# Copia build do frontend (tenta tanto /build quanto /dist)
COPY --from=builder /app/build /usr/share/nginx/html
COPY --from=builder /app/dist /usr/share/nginx/html

ENV PORT=80
EXPOSE 80

# Ajuste o comando final se o entrypoint do seu backend for diferente
CMD ["node","api.js"]
