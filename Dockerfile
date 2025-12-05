# Build do React
FROM node:18-alpine as build

WORKDIR /app

# Copia os arquivos de dependência
COPY package.json .

# Instala dependências - IGNORA package-lock.json
RUN npm install --legacy-peer-deps

# Copia o restante do código
COPY . .

# Build do React
RUN npm run build

# Servir com nginx
FROM nginx:alpine

# Copia o build do React para o nginx
COPY --from=build /app/build /usr/share/nginx/html

# Expõe a porta 80
EXPOSE 80

# Comando para iniciar o nginx
CMD ["nginx", "-g", "daemon off;"]
