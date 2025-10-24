# Etapa 1: build
FROM golang:1.23-alpine AS builder

WORKDIR /app
COPY . .
RUN go mod tidy
RUN go build -o symbolize-api ./cmd/server

# Etapa 2: imagem final
FROM alpine:3.20
WORKDIR /app
COPY --from=builder /app/symbolize-api /app/symbolize-api

EXPOSE 8080
CMD ["./symbolize-api"]
