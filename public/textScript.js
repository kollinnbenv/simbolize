document.getElementById('textInput').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        document.getElementById('searchButton').click();
    }
});

document.getElementById('searchButton').addEventListener('click', async function() {
    const textInput = document.getElementById('textInput').value.trim();
    if (textInput) {
        await processText(textInput);
    }
});

document.getElementById('clearButton').addEventListener('click', function() {
    document.getElementById('textInput').value = '';
    document.getElementById('pictograms').innerHTML = '';
});

async function processText(text) {
    const pictogramsContainer = document.getElementById('pictograms');
    pictogramsContainer.innerHTML = ''; // Limpa os pictogramas anteriores

    // Lista de palavras a serem ignoradas
    const ignoreWords = ['a', 'o', 'e', 'na', 'no'];

    // Filtra as palavras a serem ignoradas
    const words = text.split(' ').filter(word => !ignoreWords.includes(word.toLowerCase()));

    for (const word of words) {
        const pictogramId = await getPictogramId(word);
        if (pictogramId) {
            const imgUrl = `https://api.arasaac.org/api/pictograms/${pictogramId}`;
            const img = document.createElement('img');
            img.src = imgUrl;
            img.width = 40;
            img.height = 40;
            pictogramsContainer.appendChild(img);
        }
    }
}

async function getPictogramId(word) {
    const response = await fetch(`https://api.arasaac.org/v1/pictograms/br/search/${word}`);
    const data = await response.json();
    return data.length > 0 ? data[0]._id : null;
}
