FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --only=production

COPY api.js ./
COPY serviceAccountKey.json ./

EXPOSE 3000

CMD ["node", "api.js"]
