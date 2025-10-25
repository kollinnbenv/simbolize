#!/bin/bash
set -e

echo "🚀 Criando estrutura do projeto Simbolize (Go API)..."

# Estrutura de pastas
mkdir -p api/{cmd/server,internal/{http/handlers,service,config},pkg/models}
mkdir -p schema

# Arquivos Go principais
cat > api/cmd/server/main.go <<'EOF'
package main

import (
	"log"
	"net/http"
	"os"

	"simbolize/internal/http"
	"simbolize/internal/config"
)

func main() {
	cfg := config.Load()
	router := http.NewRouter()

	log.Printf("🚀 Servidor rodando na porta %s", cfg.Port)
	log.Fatal(http.ListenAndServe(":"+cfg.Port, router))
}
EOF

cat > api/internal/http/router.go <<'EOF'
package http

import (
	"net/http"

	"github.com/go-chi/chi/v5"
)

func NewRouter() *chi.Mux {
	r := chi.NewRouter()
	r.Get("/healthz", HealthHandler)
	r.Get("/pictos/search", PictosSearchHandler)
	r.Post("/tts", TTSHandler)
	r.Post("/stt", STTHandler)
	return r
}
EOF

# Handlers
cat > api/internal/http/handlers/health.go <<'EOF'
package http

import "net/http"

func HealthHandler(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("ok"))
}
EOF

cat > api/internal/http/handlers/pictos.go <<'EOF'
package http

import "net/http"

func PictosSearchHandler(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query().Get("q")
	// TODO: chamar service de pictogramas (ARASAAC)
	w.Write([]byte("Buscar pictogramas para: " + q))
}
EOF

cat > api/internal/http/handlers/tts.go <<'EOF'
package http

import "net/http"

func TTSHandler(w http.ResponseWriter, r *http.Request) {
	// TODO: converter texto em fala
	w.Write([]byte("TTS endpoint"))
}
EOF

cat > api/internal/http/handlers/stt.go <<'EOF'
package http

import "net/http"

func STTHandler(w http.ResponseWriter, r *http.Request) {
	// TODO: converter fala em texto
	w.Write([]byte("STT endpoint"))
}
EOF

# Services
cat > api/internal/service/pictos_service.go <<'EOF'
package service

// TODO: Funções que chamam API do ARASAAC e tratam o resultado
EOF

cat > api/internal/service/tts_service.go <<'EOF'
package service

// TODO: Funções para text-to-speech (usar API externa)
EOF

cat > api/internal/service/stt_service.go <<'EOF'
package service

// TODO: Funções para speech-to-text (usar API externa)
EOF

# Config
cat > api/internal/config/config.go <<'EOF'
package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	Port string
}

func Load() *Config {
	_ = godotenv.Load(".env")
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	return &Config{Port: port}
}
EOF

# Models
cat > api/pkg/models/pictogram.go <<'EOF'
package models

type Pictogram struct {
	ID       int      `json:"id"`
	Keywords []string `json:"keywords"`
	Tags     []string `json:"tags"`
	URL      string   `json:"url"`
}
EOF

# Go mod e env
cat > api/go.mod <<'EOF'
module symbolize

go 1.22

require (
	github.com/go-chi/chi/v5 v5.0.10
	github.com/joho/godotenv v1.5.1
)
EOF

touch api/go.sum
cat > api/.env.example <<'EOF'
PORT=8080
EOF

# OpenAPI schema
cat > schema/openapi.yaml <<'EOF'
openapi: 3.0.3
info:
  title: Simbolize API
  version: 1.0.0
paths:
  /healthz:
    get:
      summary: Health check
      responses:
        '200':
          description: OK
  /pictos/search:
    get:
      summary: Busca pictogramas
      parameters:
        - name: q
          in: query
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Resultado da busca
  /tts:
    post:
      summary: Texto para fala
  /stt:
    post:
      summary: Fala para texto
EOF

# Makefile
cat > Makefile <<'EOF'
run:
	cd api/cmd/server && go run main.go

test:
	go test ./...

build:
	go build -o bin/simbolize ./api/cmd/server
EOF

# docker-compose
cat > docker-compose.yml <<'EOF'
version: "3.8"
services:
  api:
    build: ./api
    ports:
      - "8080:8080"
    env_file:
      - ./api/.env.example
  frontend:
    build: ./frontend
    ports:
      - "4200:4200"
EOF

cat > .env.example <<'EOF'
# Variáveis compartilhadas (frontend e backend)
API_URL=http://localhost:8080
EOF

echo "✅ Estrutura do projeto criada com sucesso!"
