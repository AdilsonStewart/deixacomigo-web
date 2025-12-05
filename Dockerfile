# Use a imagem base do Node.js
FROM node:20-alpine

# Diretório de trabalho dentro do container
WORKDIR /app

# Copiar os arquivos de definição de dependências
COPY package*.json ./

# Instalar as dependências
RUN npm install

# Copiar o restante do código da aplicação
COPY . .

# Expor a porta que a aplicação vai rodar (ajuste se necessário)
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["npm", "start"]
