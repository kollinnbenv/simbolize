const express = require('express');
const bodyParser = require('body-parser');
const natural = require('natural');
const app = express();

// Configuração do middleware para o body parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Endpoint para renderizar o formulário
app.get('/', (req, res) => {
    res.send(`
        <html>
        <body>
            <h1>Extrair Palavras-Chave de uma Frase</h1>
            <form action="/extractKeywords" method="post">
                <label for="text">Digite sua frase:</label><br>
                <textarea id="text" name="text" rows="4" cols="50"></textarea><br><br>
                <input type="submit" value="Extrair Palavras-Chave">
            </form>
        </body>
        </html>
    `);
});

// Endpoint para extrair palavras-chave
app.post('/extractKeywords', (req, res) => {
    const { text } = req.body;
    
    // Tokenização da frase
    const tokenizer = new natural.WordTokenizer();
    const tokens = tokenizer.tokenize(text.toLowerCase());

    // Remoção de stopwords
    const stopwords = new natural.Stopwords();
    const filteredTokens = tokens.filter(token => !stopwords.contains(token));

    // Retornar palavras-chave
    res.send(`
        <html>
        <body>
            <h1>Palavras-Chave Extraídas</h1>
            <p><strong>Frase Original:</strong> ${text}</p>
            <p><strong>Palavras-Chave:</strong> ${filteredTokens.join(', ')}</p>
        </body>
        </html>
    `);
});

// Iniciar o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor iniciado na porta ${PORT}`);
});
