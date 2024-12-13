const express = require('express');
const router = express.Router();
const path = require('path');
const profissionais = require('../data/profissionais.json');

router.get('/', (req, res) => {
  res.json(profissionais);
});

module.exports = router;
