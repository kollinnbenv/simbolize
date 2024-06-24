if (!('webkitSpeechRecognition' in window) && !annyang) {
    alert("Seu navegador não suporta a Web Speech API e a biblioteca annyang.");
} else {
    let recognitionActive = false;

    if ('webkitSpeechRecognition' in window) {
        const recognition = new webkitSpeechRecognition();
        recognition.lang = 'pt-BR';
        recognition.continuous = false; // Mudança para false para finalizar quando o usuário parar de falar
        recognition.interimResults = false; // Apenas resultados finais

        recognition.onstart = function() {
            recognitionActive = true;
            console.log("Reconhecimento de voz iniciado.");
        };

        recognition.onspeechend = function() {
            recognition.stop();
            console.log("Usuário parou de falar, reconhecimento encerrado.");
        };

        recognition.onresult = async function(event) {
            let transcript = event.results[0][0].transcript.trim();
            transcript = transcript.replace(/\?$/, ''); // Remove o ponto de interrogação no final, se houver
            document.getElementById('output').textContent = transcript;
            console.log("Resultado: ", transcript);
            await processTranscript(transcript);
        };

        recognition.onerror = function(event) {
            console.error("Erro no reconhecimento de voz: ", event.error);
        };

        recognition.onend = function() {
            recognitionActive = false;
            console.log("Reconhecimento de voz encerrado.");
        };

        document.getElementById('startButton').addEventListener('click', function() {
            if (!recognitionActive) {
                recognition.start();
            }
        });

        document.getElementById('clearButton').addEventListener('click', function() {
            location.reload();
        });

    } else if (annyang) {
        var commands = {
            '*text': async function(text) {
                let transcript = text.trim();
                transcript = transcript.replace(/\?$/, ''); // Remove o ponto de interrogação no final, se houver
                document.getElementById('output').textContent = transcript;
                console.log("Resultado: ", transcript);
                await processTranscript(transcript);
            }
        };

        annyang.addCommands(commands);

        document.getElementById('startButton').addEventListener('click', function() {
            if (!recognitionActive) {
                annyang.start();
                recognitionActive = true;
                console.log("Reconhecimento de voz iniciado.");
            }
        });

        document.getElementById('clearButton').addEventListener('click', function() {
            location.reload();
        });

        annyang.addCallback('error', function() {
            console.error("Erro no reconhecimento de voz.");
        });

        annyang.addCallback('end', function() {
            recognitionActive = false;
            console.log("Reconhecimento de voz encerrado.");
        });
    }
}

async function processTranscript(transcript) {
    const pictogramsContainer = document.getElementById('pictograms');
    pictogramsContainer.innerHTML = ''; // Limpa os pictogramas anteriores

    // Lista de palavras a serem ignoradas
    const ignoreWords = ['a', 'o', 'e', 'na', 'no'];

    // Filtra as palavras a serem ignoradas
    const words = transcript.split(' ').filter(word => !ignoreWords.includes(word.toLowerCase()));

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
