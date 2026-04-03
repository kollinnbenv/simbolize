FROM node:22-alpine AS web_builder
WORKDIR /frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci --no-audit --omit=optional
COPY frontend/ .
RUN npm run build -- --configuration production

FROM golang:1.23-alpine AS api_builder
WORKDIR /src
ENV CGO_ENABLED=0 GOFLAGS=-mod=readonly
COPY api/go.mod ./
RUN go mod download
COPY api/ .
RUN go build -trimpath -ldflags="-s -w" -o /out/symbolize-api ./cmd/server

FROM alpine:3.20 AS api_runtime
RUN apk add --no-cache ca-certificates \
    && addgroup -S app \
    && adduser -S -G app app
WORKDIR /app
COPY --from=api_builder /out/symbolize-api /app/symbolize-api
USER app
EXPOSE 8080
ENV PORT=8080
CMD ["./symbolize-api"]

FROM nginxinc/nginx-unprivileged:1.29-alpine AS frontend_runtime
COPY --from=web_builder /frontend/dist/simbolize-app/browser /usr/share/nginx/html
COPY frontend/nginx/default.conf /etc/nginx/conf.d/default.conf.template
COPY --chmod=755 frontend/nginx/start-nginx.sh /usr/local/bin/start-nginx.sh
ENV PORT=8080
ENV API_UPSTREAM=http://api:8080
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD sh -c 'wget -q -O /dev/null "http://127.0.0.1:${PORT}/" || exit 1'
CMD ["/usr/local/bin/start-nginx.sh"]

FROM frontend_runtime AS render_runtime
COPY --from=api_builder /out/symbolize-api /app/symbolize-api
COPY --chmod=755 docker/start-render.sh /usr/local/bin/start-render.sh
ENV API_PORT=18080
CMD ["/usr/local/bin/start-render.sh"]
