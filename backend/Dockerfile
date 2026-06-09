# Бэкенд SKS Quest (Node.js + Express).
# Используем полный образ node:20 — в нём есть python3/make/g++,
# необходимые для сборки нативного модуля bcrypt.
FROM node:20

WORKDIR /app

# Сначала зависимости — лучше кешируется при сборке
COPY package*.json ./
RUN npm ci --omit=dev

# Затем исходники
COPY . .

EXPOSE 5000

CMD ["node", "server.js"]
