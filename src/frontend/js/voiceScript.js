if (!('webkitSpeechRecognition' in window) && !annyang) {
    alert("Seu navegador não suporta a Web Speech API nem a biblioteca annyang.");
  } else {
    let recognitionActive = false;
  
    if ('webkitSpeechRecognition' in window) {
      const recognition = new webkitSpeechRecognition();
      recognition.lang = 'pt-BR';
      recognition.continuous = false;
      recognition.interimResults = false;
  
      recognition.onstart = function() {
        recognitionActive = true;
      };
  
      recognition.onspeechend = function() {
        recognition.stop();
      };
  
      recognition.onresult = async function(event) {
        let transcript = event.results[0][0].transcript.trim();
        transcript = transcript.replace(/\?$/, '');
        document.getElementById('output').textContent = transcript;
        await processTranscript(transcript);
      };
  
      recognition.onerror = function(event) {
        console.error("Erro no reconhecimento de voz: ", event.error);
      };
  
      recognition.onend = function() {
        recognitionActive = false;
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
          transcript = transcript.replace(/\?$/, '');
          document.getElementById('output').textContent = transcript;
          await processTranscript(transcript);
        }
      };
  
      annyang.addCommands(commands);
  
      document.getElementById('startButton').addEventListener('click', function() {
        if (!recognitionActive) {
          annyang.start();
          recognitionActive = true;
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
      });
    }
  }
  
  async function processTranscript(transcript) {
    const pictogramsContainer = document.getElementById('pictograms');
    pictogramsContainer.innerHTML = '';
  
    const ignoreWords = ['a', 'o', 'e', 'na', 'no'];
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
  