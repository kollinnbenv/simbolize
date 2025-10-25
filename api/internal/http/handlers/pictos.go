package handlers

import (
	"context"
	"encoding/json"
	"errors"
	"io"
	"net"
	"net/http"
	"net/url"
	"os"
	"regexp"
	"sort"
	"strconv"
	"strings"
	"time"
)

// ---------- HTTP client ----------
var httpClient = &http.Client{
	Timeout: 8 * time.Second,
	Transport: &http.Transport{
		Proxy: http.ProxyFromEnvironment,
		DialContext: (&net.Dialer{
			Timeout:   5 * time.Second,
			KeepAlive: 30 * time.Second,
		}).DialContext,
		MaxIdleConns:          50,
		IdleConnTimeout:       30 * time.Second,
		TLSHandshakeTimeout:   5 * time.Second,
		ExpectContinueTimeout: 1 * time.Second,
	},
}

// ---------- Tipos (mínimos) do ARASAAC ----------
type arasaacKeyword struct {
	Keyword     string `json:"keyword"`
	Type        int    `json:"type"`        // 2=subst, 3=verbo, 4=adj (em geral)
	HasLocution bool   `json:"hasLocution"` // locução = muito relevante
}

type arasaacItem struct {
	ID         int              `json:"_id"`
	Tags       []string         `json:"tags"`
	Synsets    []string         `json:"synsets"` // ex: 02086723-n, 01910816-v
	Schematic  bool             `json:"schematic"`
	Keywords   []arasaacKeyword `json:"keywords"`
	Categories []string         `json:"categories"` // ex: verb, pet, ultra-processed food, beverage
	AAC        bool             `json:"aac"`
	Score      *float64         `json:"score,omitempty"`
}

// ---------- Saída do nosso endpoint ----------
type Picto struct {
	ID         int      `json:"id"`
	Label      string   `json:"label,omitempty"`
	Synset     string   `json:"synset,omitempty"`
	Categories []string `json:"categories,omitempty"`
	Image      struct {
		PNG string `json:"png,omitempty"`
		SVG string `json:"svg,omitempty"`
	} `json:"image"`
	Reason []string `json:"reason,omitempty"` // explicabilidade simples
}

type RankedResponse struct {
	Source       string  `json:"source"`
	Input        string  `json:"input"`
	Intent       string  `json:"intent"`
	Chosen       []Picto `json:"chosen"`
	Alternatives []Picto `json:"alternatives"`
	License      struct {
		Name        string `json:"name"`
		Attribution string `json:"attribution"`
	} `json:"license"`
}

// ---------- helpers ----------
func hasCategory(it arasaacItem, c string) bool {
	c = strings.ToLower(c)
	for _, x := range it.Categories {
		if strings.ToLower(x) == c {
			return true
		}
	}
	return false
}
func hasSynsetSuffix(it arasaacItem, suf string) bool {
	for _, s := range it.Synsets {
		if strings.HasSuffix(s, suf) {
			return true
		}
	}
	return false
}
func hasSynset(it arasaacItem, s string) bool {
	for _, x := range it.Synsets {
		if x == s {
			return true
		}
	}
	return false
}
func anyKeywordContains(it arasaacItem, needles ...string) bool {
	for _, k := range it.Keywords {
		kw := strings.ToLower(k.Keyword)
		for _, n := range needles {
			if strings.Contains(kw, strings.ToLower(n)) {
				return true
			}
		}
	}
	return false
}
func kwContainsAny(tokens []string, s string) bool {
	s = strings.ToLower(s)
	for _, t := range tokens {
		if strings.Contains(s, strings.ToLower(t)) {
			return true
		}
	}
	return false
}

func min(a, b float64) float64 {
	if a < b {
		return a
	}
	return b
}

// ---------- Intent + extrações ----------
var reJuice = regexp.MustCompile(`\b(?:suco|sumo)\s+de\s+([a-zãõâêîôûáéíóúç\s-]+)`)

// retorna (intent, frutaAlvo | "")
func detectIntentAndFruit(q string) (string, string) {
	t := strings.ToLower(q)

	// suco de X ?
	if m := reJuice.FindStringSubmatch(t); len(m) == 2 {
		fruit := strings.TrimSpace(m[1])
		// normalizações simples
		fruit = strings.ReplaceAll(fruit, "uva roxa", "uva")
		fruit = strings.ReplaceAll(fruit, "suco", "")
		fruit = strings.TrimSpace(fruit)
		return "food", fruit
	}

	// locuções fortes
	if strings.Contains(t, "cachorro-quente") || strings.Contains(t, "hot dog") {
		return "food", ""
	}

	// verbos comuns
	verbs := []string{"passear", "alimentar", "dar comida", "comer", "escovar", "brincar", "ir", "levar", "passear com o", "passear com a"}
	for _, v := range verbs {
		if strings.Contains(t, v) {
			return "action", ""
		}
	}

	// lugares
	places := []string{"parque", "loja", "venda", "pet shop", "clínica", "veterinário"}
	for _, p := range places {
		if strings.Contains(t, p) {
			return "place", ""
		}
	}

	return "entity", ""
}

// ---------- Pré-filtro por intenção ----------
func prefilterByIntent(items []arasaacItem, intent string, fruit string) []arasaacItem {
	var out []arasaacItem
	for _, it := range items {
		switch intent {
		case "action":
			if hasCategory(it, "verb") || hasSynsetSuffix(it, "-v") {
				out = append(out, it)
			}
		case "food":
			// bebida / comida / cozinha / ultra processado
			if hasCategory(it, "beverage") || hasCategory(it, "drink") ||
				hasCategory(it, "ultra-processed food") || hasCategory(it, "cookery") ||
				anyKeywordContains(it, "suco", "sumo", "juice") {
				out = append(out, it)
				continue
			}
			// se já sabemos a fruta, aceita itens que mencionam explicitamente
			if fruit != "" && anyKeywordContains(it, fruit) {
				out = append(out, it)
			}
		case "place":
			if hasCategory(it, "facility") || anyKeywordContains(it, "parque de cachorro", "parque de cães") {
				out = append(out, it)
			}
		case "entity":
			if hasCategory(it, "pet") || hasSynset(it, "02086723-n") || anyKeywordContains(it, "cachorro", "cão") {
				out = append(out, it)
			}
		}
	}
	if len(out) == 0 {
		return items
	}
	return out
}

// ---------- Scoring ----------
type scored struct {
	item   arasaacItem
	score  float64
	reason []string
}

// frutas comuns para penalizar falsas-positivas quando fruit alvo existir
var knownFruits = []string{
	"laranja", "laranjada", "maçã", "maca", "banana", "uva", "morango", "abacaxi", "limão", "limao", "manga",
}

func scoreItem(it arasaacItem, intent string, q string, fruit string) scored {
	total := 0.0
	var why []string
	q = strings.ToLower(q)

	switch intent {
	case "action":
		if hasCategory(it, "verb") {
			total += 5
			why = append(why, "categoria:verb +5")
		}
		if hasSynsetSuffix(it, "-v") {
			total += 3
			why = append(why, "synset:-v +3")
		}
	case "entity":
		if hasCategory(it, "pet") {
			total += 4
			why = append(why, "categoria:pet +4")
		}
		if hasSynset(it, "02086723-n") {
			total += 3
			why = append(why, "synset:02086723-n +3")
		}
		if hasCategory(it, "ultra-processed food") || hasCategory(it, "catering establishment") {
			total -= 4
			why = append(why, "penaliza:comida/lugar -4")
		}
	case "food":
		// categorias de bebida/comida
		if hasCategory(it, "beverage") || hasCategory(it, "drink") {
			total += 5
			why = append(why, "categoria:beverage/drink +5")
		}
		if hasCategory(it, "ultra-processed food") || hasCategory(it, "cookery") {
			total += 2
			why = append(why, "categoria:food/cookery +2")
		}
		// palavras-chave de suco
		if anyKeywordContains(it, "suco", "sumo", "juice") {
			total += 4
			why = append(why, "keyword:suco +4")
		}
		// bônus forte para a fruta-alvo
		if fruit != "" && anyKeywordContains(it, fruit) {
			total += 6
			why = append(why, "fruta-alvo +6")
		}
		// se há fruta-alvo, penaliza frutas diferentes para evitar laranjada
		if fruit != "" {
			for _, f := range knownFruits {
				if f == fruit {
					continue
				}
				// se o item fala explicitamente de outra fruta, penaliza
				if anyKeywordContains(it, f) {
					total -= 4
					why = append(why, "fruta divergente -4")
					break
				}
			}
		}
	case "place":
		if hasCategory(it, "facility") {
			total += 4
			why = append(why, "categoria:facility +4")
		}
	}

	// locução
	for _, kw := range it.Keywords {
		if strings.Contains(strings.ToLower(kw.Keyword), q) && kw.HasLocution {
			total += 5
			why = append(why, "locução +5")
			break
		}
	}

	// match parcial
	if anyKeywordContains(it, q) {
		total += 2
		why = append(why, "match keyword +2")
	}

	// AAC / schematic
	if it.AAC {
		total += 2
		why = append(why, "aac +2")
	}
	if it.Schematic {
		total += 1
		why = append(why, "schematic +1")
	}

	if it.Score != nil {
		total += min(*it.Score/10.0, 2)
		why = append(why, "score nativo +≤2")
	}

	return scored{item: it, score: total, reason: why}
}

// ---------- Dedup ----------
func dedupAndPick(scoredItems []scored, topChosen int, topAlt int) (chosen, alternatives []scored) {
	type key struct {
		synset string
		id     int
	}
	group := map[key][]scored{}
	for _, sc := range scoredItems {
		syn := ""
		if len(sc.item.Synsets) > 0 {
			syn = sc.item.Synsets[0]
		}
		k := key{synset: syn, id: sc.item.ID}
		group[k] = append(group[k], sc)
	}
	var best []scored
	for _, arr := range group {
		sort.Slice(arr, func(i, j int) bool { return arr[i].score > arr[j].score })
		best = append(best, arr[0])
	}
	sort.Slice(best, func(i, j int) bool { return best[i].score > best[j].score })

	if len(best) > topChosen {
		chosen = best[:topChosen]
		rest := best[topChosen:]
		if len(rest) > topAlt {
			alternatives = rest[:topAlt]
		} else {
			alternatives = rest
		}
	} else {
		chosen = best
	}
	return
}

// ---------- URLs de imagem ----------
func buildImageURLs(id int) (png300, svg string) {
	base := "https://static.arasaac.org/pictograms"
	sid := strconv.Itoa(id)
	png := base + "/" + sid + "/" + sid + "_300.png"
	svg = base + "/" + sid + "/" + sid + ".svg"
	return png, svg
}

// ---------- Chamada ARASAAC ----------
func fetchArasaac(ctx context.Context, base, lang, q string) ([]arasaacItem, string, error) {
	escapedQ := url.PathEscape(q)
	urlFinal := base + "/v1/pictograms/" + url.PathEscape(lang) + "/search/" + escapedQ
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, urlFinal, nil)
	if err != nil {
		return nil, urlFinal, err
	}
	req.Header.Set("User-Agent", "Simbolize-MVP/1.0 (+https://arasaac.org)")
	resp, err := httpClient.Do(req)
	if err != nil {
		return nil, urlFinal, err
	}
	defer resp.Body.Close()
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		b, _ := io.ReadAll(io.LimitReader(resp.Body, 8<<10))
		return nil, urlFinal, errors.New(resp.Status + " " + string(b))
	}
	var items []arasaacItem
	if err := json.NewDecoder(resp.Body).Decode(&items); err != nil {
		return nil, urlFinal, err
	}
	return items, urlFinal, nil
}

// ---------- Handler principal ----------
func PictosSearchHandler(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query().Get("q")
	if q == "" {
		http.Error(w, "missing query param: q", http.StatusBadRequest)
		return
	}
	lang := r.URL.Query().Get("lang")
	if lang == "" {
		lang = "br"
	}
	base := os.Getenv("ARASAAC_BASE_URL")
	if base == "" {
		base = "https://api.arasaac.org"
	}

	ctx, cancel := context.WithTimeout(r.Context(), 10*time.Second)
	defer cancel()

	// 1) busca principal
	items, mainURL, err := fetchArasaac(ctx, base, lang, q)
	if err != nil {
		http.Error(w, "failed to call ARASAAC: "+err.Error(), http.StatusBadGateway)
		return
	}

	intent, fruit := detectIntentAndFruit(q)
	filtered := prefilterByIntent(items, intent, fruit)

	// score
	var scoredItems []scored
	for _, it := range filtered {
		scoredItems = append(scoredItems, scoreItem(it, intent, q, fruit))
	}

	// pick (2 escolhidos e 3 alternativas)
	chosenS, altS := dedupAndPick(scoredItems, 2, 3)

	// 2) (opcional) se é "suco de X" e não temos nenhum picto da fruta, puxar 1 picto da fruta
	addFruitPic := func() *scored {
		if fruit == "" {
			return nil
		}
		// já temos algo da fruta?
		for _, s := range append(chosenS, altS...) {
			if anyKeywordContains(s.item, fruit) {
				return nil
			}
		}
		// buscar a fruta isolada
		fruitItems, _, err2 := fetchArasaac(ctx, base, lang, fruit)
		if err2 != nil || len(fruitItems) == 0 {
			return nil
		}
		// preferir itens entidade/fruta
		var scoredFruit []scored
		for _, it := range fruitItems {
			scoredFruit = append(scoredFruit, scoreItem(it, "entity", fruit, fruit))
		}
		sort.Slice(scoredFruit, func(i, j int) bool { return scoredFruit[i].score > scoredFruit[j].score })
		return &scoredFruit[0]
	}
	if s := addFruitPic(); s != nil {
		// inclui fruta como chosen[1] (ou append se só um chosen)
		if len(chosenS) == 0 {
			chosenS = append(chosenS, *s)
		} else if len(chosenS) == 1 {
			chosenS = append(chosenS, *s)
		} else {
			// substitui a última alternativa
			if len(altS) > 0 {
				altS[len(altS)-1] = *s
			} else {
				altS = append(altS, *s)
			}
		}
	}

	// transformar para saída simples
	toPicto := func(s scored) Picto {
		label := ""
		if len(s.item.Keywords) > 0 {
			label = s.item.Keywords[0].Keyword
		}
		syn := ""
		if len(s.item.Synsets) > 0 {
			syn = s.item.Synsets[0]
		}
		p := Picto{
			ID:         s.item.ID,
			Label:      label,
			Synset:     syn,
			Categories: s.item.Categories,
			Reason:     s.reason,
		}
		png, svg := buildImageURLs(s.item.ID)
		p.Image.PNG = png
		p.Image.SVG = svg
		return p
	}

	var chosen []Picto
	for _, s := range chosenS {
		chosen = append(chosen, toPicto(s))
	}
	var alts []Picto
	for _, s := range altS {
		alts = append(alts, toPicto(s))
	}

	out := RankedResponse{
		Source:       mainURL,
		Input:        q,
		Intent:       intent,
		Chosen:       chosen,
		Alternatives: alts,
	}
	out.License.Name = "CC BY-NC-SA 4.0"
	out.License.Attribution = "Pictograms by Sergio Palao, © Gobierno de Aragón (ARASAAC)"

	w.Header().Set("Content-Type", "application/json")
	enc := json.NewEncoder(w)
	enc.SetEscapeHTML(false)
	if err := enc.Encode(out); err != nil && !errors.Is(err, context.Canceled) {
		http.Error(w, "failed to encode response", http.StatusInternalServerError)
		return
	}
}
