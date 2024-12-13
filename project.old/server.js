const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/voice', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'voice.html'));
});

app.get('/text', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'text.html'));
});

app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'about.html'));
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
