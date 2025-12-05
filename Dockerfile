# Usar Node.js 20 (exigido pelo react-router 7.9.6)
FROM node:18-alpine as builder

WORKDIR /app

# Copiar package.json
COPY package.json .

# Instalar dependências com override
RUN npm install --legacy-peer-deps

# Copiar código
COPY . .

# Build do React
RUN npm run build

# Servir com nginx
FROM nginx:alpine

# Copiar build
COPY --from=builder /app/build /usr/share/nginx/html

# Configuração para React Router
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
