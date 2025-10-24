package main

import (
	"log"
	"net/http"
	"os"
	"path/filepath"
)

func main() {
	mux := http.NewServeMux()

	// === Rotas da API ===
	mux.HandleFunc("/healthz", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("ok"))
	})

	// === Servir o Angular (estático) ===
	// Arquivos gerados estão em ./web
	fs := http.FileServer(http.Dir("./web"))

	// 1) Tenta servir arquivos estáticos (assets, js, css, etc.)
	mux.Handle("/assets/", fs)
	mux.Handle("/favicon.ico", fs)

	// 2) SPA fallback: para qualquer outra rota "de front",
	//    se não for arquivo real, devolve index.html
	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		path := filepath.Join("./web", r.URL.Path)
		if info, err := os.Stat(path); err == nil && !info.IsDir() {
			// é um arquivo existente: serve estático
			http.ServeFile(w, r, path)
			return
		}
		// caso contrário, devolve index.html (rota SPA)
		http.ServeFile(w, r, "./web/index.html")
	})

	// CORS simples (se precisar chamar a API a partir de outra origem)
	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		mux.ServeHTTP(w, r)
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	log.Println("Server on :" + port)
	log.Fatal(http.ListenAndServe(":"+port, handler))
}
