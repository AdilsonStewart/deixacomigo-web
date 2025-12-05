# Build
FROM node:18 AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Serve com NGINX
FROM nginx:alpine

# Copia o nginx.conf personalizado
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia o build
COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80

