const express = require('express');
const router = express.Router();
const projetos = require('../data/projetos.json');

router.get('/', (req, res) => {
  res.json(projetos);
});

module.exports = router;
