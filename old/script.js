// Verificando suporte ao webkitSpeechRecognition
if (!('webkitSpeechRecognition' in window) && !annyang) {
    alert("Seu navegador não suporta a Web Speech API e a biblioteca annyang.");
  } else {
    if ('webkitSpeechRecognition' in window) {
      // Usando webkitSpeechRecognition
      const recognition = new webkitSpeechRecognition();
      recognition.lang = 'pt-BR';
      recognition.continuous = true;
      recognition.interimResults = false;
  
      recognition.onstart = function() {
        console.log("Reconhecimento de voz iniciado.");
      };
  
      recognition.onresult = async function(event) {
        const transcript = event.results[0][0].transcript;
        document.getElementById('output').textContent = transcript;
        console.log("Resultado: ", transcript);
        await processTranscript(transcript);
      };
  
      recognition.onerror = function(event) {
        console.error("Erro no reconhecimento de voz: ", event.error);
      };
  
      recognition.onend = function() {
        console.log("Reconhecimento de voz encerrado.");
      };
  
      document.getElementById('startButton').addEventListener('click', function() {
        recognition.start();
      });
  
    } else if (annyang) {
      // Usando annyang
      var commands = {
        '*text': async function(text) {
          document.getElementById('output').textContent = text;
          console.log("Resultado: ", text);
          await processTranscript(text);
        }
      };
  
      annyang.addCommands(commands);
  
      document.getElementById('startButton').addEventListener('click', function() {
        annyang.start();
        console.log("Reconhecimento de voz iniciado.");
      });
  
      annyang.addCallback('error', function() {
        console.error("Erro no reconhecimento de voz.");
      });
  
      annyang.addCallback('end', function() {
        console.log("Reconhecimento de voz encerrado.");
      });
    }
  }
  
  async function processTranscript(transcript) {
    const words = transcript.split(' ');
    const pictogramsContainer = document.getElementById('pictograms');
    pictogramsContainer.innerHTML = ''; // Limpa os pictogramas anteriores
  
    for (const word of words) {
      const pictogramId = await getPictogramId(word);
      if (pictogramId) {
        const imgUrl = `https://api.arasaac.org/api/pictograms/${pictogramId}`;
        const img = document.createElement('img');
        img.src = imgUrl;
        pictogramsContainer.appendChild(img);
      }
    }
  }
  
  async function getPictogramId(word) {
    const response = await fetch(`https://api.arasaac.org/v1/pictograms/br/search/${word}`);
    const data = await response.json();
    return data.length > 0 ? data[0]._id : null;
  }
  