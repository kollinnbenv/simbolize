# Etapa 1: build do Angular
FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --omit=optional
COPY . .
RUN npm run build -- --configuration production

# Etapa 2: servir com Nginx sem root
FROM nginxinc/nginx-unprivileged:1.29-alpine
COPY --from=builder /app/dist/simbolize-app/browser /usr/share/nginx/html
COPY nginx/default.conf /etc/nginx/conf.d/default.conf.template
COPY --chmod=755 nginx/start-nginx.sh /usr/local/bin/start-nginx.sh

ENV PORT=8080
ENV API_UPSTREAM=http://api:8080

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD sh -c 'wget -q -O /dev/null "http://127.0.0.1:${PORT}/" || exit 1'

CMD ["/usr/local/bin/start-nginx.sh"]
