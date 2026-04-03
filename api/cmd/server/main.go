package main

import (
	"log"
	"net/http"
	"net/url"
	"os"
	"strings"
	"time"

	"simbolize/internal/http/router"
)

const (
	defaultPort  = "8080"
	maxBodyBytes = int64(1 << 20) // 1 MiB
)

func main() {
	mux := router.NewRouter()

	allowedOrigins := parseAllowedOrigins(os.Getenv("CORS_ORIGINS"))

	handler := withRecover(withSecurityHeaders(withCORS(withBodyLimit(mux, maxBodyBytes), allowedOrigins)))

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
		ReadTimeout:       15 * time.Second,
		WriteTimeout:      20 * time.Second,
		IdleTimeout:       60 * time.Second,
		MaxHeaderBytes:    1 << 20,
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
	return defaultPort
}

func withRecover(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		defer func() {
			if recovered := recover(); recovered != nil {
				log.Printf("panic recovered: %v", recovered)
				http.Error(w, "internal server error", http.StatusInternalServerError)
			}
		}()
		next.ServeHTTP(w, r)
	})
}

func withBodyLimit(next http.Handler, maxBytes int64) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodPost, http.MethodPut, http.MethodPatch:
			r.Body = http.MaxBytesReader(w, r.Body, maxBytes)
		}
		next.ServeHTTP(w, r)
	})
}

func withSecurityHeaders(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		h := w.Header()
		h.Set("X-Content-Type-Options", "nosniff")
		h.Set("X-Frame-Options", "DENY")
		h.Set("Referrer-Policy", "no-referrer")
		h.Set("X-XSS-Protection", "0")
		h.Set("Permissions-Policy", "camera=(), geolocation=(), microphone=()")
		h.Set("Cross-Origin-Resource-Policy", "same-origin")
		h.Set("Content-Security-Policy", "default-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'")
		next.ServeHTTP(w, r)
	})
}

func withCORS(next http.Handler, allowedOrigins map[string]struct{}) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		origin := normalizeOrigin(r.Header.Get("Origin"))
		if origin != "" {
			addVaryHeader(w.Header(), "Origin")
			if _, ok := allowedOrigins[origin]; ok {
				w.Header().Set("Access-Control-Allow-Origin", origin)
				w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
				w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
				w.Header().Set("Access-Control-Max-Age", "600")
			}
		}

		if r.Method == http.MethodOptions {
			if origin != "" {
				if _, ok := allowedOrigins[origin]; !ok {
					http.Error(w, "origin not allowed", http.StatusForbidden)
					return
				}
			}
			w.WriteHeader(http.StatusNoContent)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func parseAllowedOrigins(raw string) map[string]struct{} {
	out := map[string]struct{}{}
	for _, item := range strings.Split(raw, ",") {
		if origin := normalizeOrigin(item); origin != "" {
			out[origin] = struct{}{}
		}
	}
	if len(out) == 0 {
		out["http://localhost:4200"] = struct{}{}
		out["http://127.0.0.1:4200"] = struct{}{}
	}
	return out
}

func normalizeOrigin(origin string) string {
	origin = strings.TrimSpace(strings.TrimSuffix(origin, "/"))
	if origin == "" {
		return ""
	}
	u, err := url.Parse(origin)
	if err != nil || u.Host == "" {
		return ""
	}
	scheme := strings.ToLower(u.Scheme)
	if scheme != "http" && scheme != "https" {
		return ""
	}
	if u.Path != "" && u.Path != "/" {
		return ""
	}
	if u.RawQuery != "" || u.Fragment != "" || u.User != nil {
		return ""
	}
	return scheme + "://" + strings.ToLower(u.Host)
}

func addVaryHeader(h http.Header, value string) {
	for _, item := range h.Values("Vary") {
		for _, token := range strings.Split(item, ",") {
			if strings.EqualFold(strings.TrimSpace(token), value) {
				return
			}
		}
	}
	h.Add("Vary", value)
}
