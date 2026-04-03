# Etapa 1: build
FROM golang:1.23-alpine AS builder

WORKDIR /src
ENV CGO_ENABLED=0 GOFLAGS=-mod=readonly

COPY go.mod ./
RUN go mod download

COPY . .
RUN go build -trimpath -ldflags="-s -w" -o /out/symbolize-api ./cmd/server

# Etapa 2: runtime
FROM alpine:3.20

RUN apk add --no-cache ca-certificates \
    && addgroup -S app \
    && adduser -S -G app app

WORKDIR /app
COPY --from=builder /out/symbolize-api /app/symbolize-api

USER app
EXPOSE 8080
ENV PORT=8080

CMD ["./symbolize-api"]
