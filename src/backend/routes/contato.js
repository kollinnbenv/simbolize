const express = require('express');
const router = express.Router();

router.post('/', (req, res) => {
  // Exemplo simples: apenas exibe os dados do formulário no console
  console.log('Mensagem de contato recebida:', req.body);
  res.json({ message: 'Mensagem recebida com sucesso!' });
});

module.exports = router;
