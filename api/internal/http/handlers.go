package http

import (
	"encoding/json"
	"net/http"
)

// GET /healthz
func HealthHandler(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
	_, _ = w.Write([]byte("ok"))
}

type Pictogram struct {
	ID      int    `json:"id"`
	Keyword string `json:"keyword"`
}

// GET /pictos/search?q=...
func PictosSearchHandler(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query().Get("q")
	resp := map[string]any{
		"q":       q,
		"results": []Pictogram{},
	}
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(resp)
}

// POST /tts
func TTSHandler(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusNotImplemented)
	_, _ = w.Write([]byte("TTS not implemented"))
}

// POST /stt
func STTHandler(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusNotImplemented)
	_, _ = w.Write([]byte("STT not implemented"))
}
