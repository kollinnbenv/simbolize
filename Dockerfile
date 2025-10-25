# 1) Build do FRONT (Angular)
FROM node:22-alpine AS web_builder
WORKDIR /frontend
COPY frontend/package*.json ./
RUN npm install

COPY frontend/ .
RUN npm run build -- --configuration production

# 2) Build da API (Go)
FROM golang:1.25-alpine AS api_builder
WORKDIR /app

# Dependências Go
COPY api/go.mod api/go.sum ./
RUN go mod download

# Código da API
COPY api/ .

COPY --from=web_builder /frontend/dist/simbolize-app/browser ./web

ENV CGO_ENABLED=0
RUN go build -o symbolize-api ./cmd/server

# 3) Runtime final
FROM alpine:3.20
WORKDIR /app

COPY --from=api_builder /app/symbolize-api /app/symbolize-api
COPY --from=api_builder /app/web /app/web

EXPOSE 8080
ENV PORT=8080
CMD ["./symbolize-api"]
