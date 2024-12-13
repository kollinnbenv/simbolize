const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Rotas da API
const profissionaisRoute = require('./routes/profissionais');
const projetosRoute = require('./routes/projetos');
const contatoRoute = require('./routes/contato');

app.use('/api/profissionais', profissionaisRoute);
app.use('/api/projetos', projetosRoute);
app.use('/api/contato', contatoRoute);

// Servir arquivos estáticos do frontend
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// Qualquer rota que não seja API retorna o index (ou a página requisitada se for SPA, mas aqui temos páginas separadas)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

// Porta
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
