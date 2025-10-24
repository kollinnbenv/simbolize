package http

import "net/http"

func NewRouter() *http.ServeMux {
	mux := http.NewServeMux()

	mux.HandleFunc("GET /healthz", HealthHandler)
	mux.HandleFunc("GET /pictos/search", PictosSearchHandler)
	mux.HandleFunc("POST /tts", TTSHandler)
	mux.HandleFunc("POST /stt", STTHandler)

	return mux
}
