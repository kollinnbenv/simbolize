package main

import (
	"log"
	"net/http"
	"os"
	"time"

	"simbolize/internal/http/router"
)

func main() {
	mux := router.NewRouter()

	// CORS bem simples para MVP
	handler := withCORS(mux)

	// (Opcional) servir estáticos do ./web se existir
	if _, err := os.Stat("./web"); err == nil {
		fs := http.FileServer(http.Dir("./web"))
		mux.Handle("/", fs)
	}

	addr := ":" + port()
	srv := &http.Server{
		Addr:              addr,
		Handler:           handler,
		ReadHeaderTimeout: 5 * time.Second,
	}

	log.Printf("API ouvindo em %s", addr)
	if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		log.Fatal(err)
	}
}

func port() string {
	if p := os.Getenv("PORT"); p != "" {
		return p
	}
	return "8080"
}

func withCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Ajuste a origem se for preciso restringir
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}
