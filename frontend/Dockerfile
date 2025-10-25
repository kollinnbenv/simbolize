# Etapa 1: build do Angular
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build -- --configuration production

# Etapa 2: servir com Nginx
FROM nginx:1.27-alpine
COPY --from=builder /app/dist/simbolize-app/browser /usr/share/nginx/html
EXPOSE 80
