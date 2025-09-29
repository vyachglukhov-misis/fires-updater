# --- запуск командой ---
# docker build --network=host -f Dockerfile -t fires-tiff-updater:1.0.0 .

FROM node:23-bullseye AS builder

WORKDIR /app

COPY package*.json ./

RUN npm config set registry https://registry.npmmirror.com
RUN npm install

COPY tsconfig.json ./
COPY src ./src

RUN npm run build

FROM node:23-bullseye-slim

WORKDIR /app

# Установка GDAL в финальный образ
RUN apt-get update && apt-get install -y \
    curl \
    gdal-bin \
    python3 \
    && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/tsconfig.json ./tsconfig.json

COPY --from=builder /app/dist ./dist

CMD ["npm", "run", "start"]
