package router

import (
	"net/http"

	"simbolize/internal/http/handlers"
)

func NewRouter() *http.ServeMux {
	mux := http.NewServeMux()

	// Rotas de API
	mux.HandleFunc("/healthz", method(http.MethodGet, handlers.HealthHandler))
	mux.HandleFunc("/pictos/search", method(http.MethodGet, handlers.PictosSearchHandler))
	mux.HandleFunc("/tts", method(http.MethodPost, handlers.TTSHandler))
	mux.HandleFunc("/stt", method(http.MethodPost, handlers.STTHandler))

	return mux
}

func method(verb string, next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != verb {
			w.Header().Set("Allow", verb)
			http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
			return
		}
		next(w, r)
	}
}
