package router

import (
	"net/http"

	"simbolize/internal/http/handlers"
)

func NewRouter() *http.ServeMux {
	mux := http.NewServeMux()

	// Rotas de API
	mux.HandleFunc("GET /healthz", handlers.HealthHandler)
	mux.HandleFunc("GET /pictos/search", handlers.PictosSearchHandler)
	mux.HandleFunc("POST /tts", handlers.TTSHandler)
	mux.HandleFunc("POST /stt", handlers.STTHandler)

	return mux
}
