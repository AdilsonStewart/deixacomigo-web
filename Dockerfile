# Usar Node.js 18 (versão mais estável para Create React App)
FROM node:18-alpine

# Diretório da aplicação
WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências
RUN npm install --legacy-peer-deps

# Copiar todo o código da aplicação
COPY . .

# Build do React
RUN npm run build

# Instalar servidor estático simples
RUN npm install -g serve

# Expor a porta 3000
EXPOSE 3000

# Comando para iniciar
CMD ["serve", "-s", "build", "-l", "3000"]
