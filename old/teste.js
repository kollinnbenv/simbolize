function updatemenu() {
    if (document.getElementById('responsive-menu').checked == true) {
        document.getElementById('menu').style.borderBottomRightRadius = '0';
        document.getElementById('menu').style.borderBottomLeftRadius = '0';
    } else {
        document.getElementById('menu').style.borderRadius = '100px';
    }
  }
  
  const button = document.getElementById('microphone-button');
  const limparButton = document.getElementById('limpar-button');
  let recognition;
  let pictogramUrls = [];
  
  // Função para criar reconhecimento de fala
  function createRecognition() {
      let SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition !== undefined) {
          recognition = new SpeechRecognition();
      } else if (annyang) {
          recognition = annyang;
          SpeechRecognition = true;
      } else {
          alert("Reconhecimento de fala não suportado neste navegador.");
          return null;
      }
  
      if (SpeechRecognition) {
          recognition.lang = "pt_BR";
          recognition.onstart = () => console.log('Iniciou reconhecimento de fala');
          recognition.onend = () => console.log('Encerrou reconhecimento de fala');
          recognition.onerror = e => console.log('Erro no reconhecimento de fala:', e);
          recognition.onresult = e => {
              let fraseReconhecida;
              if (e.results) { // Resultado do webkitSpeechRecognition
                  fraseReconhecida = Array.from(e.results)
                      .map(result => result[0])
                      .map(result => result.transcript)
                      .join(' ');
              } else { // Resultado do annyang
                  fraseReconhecida = e;
              }
              buscarPictogramas(fraseReconhecida);
          };
      }
  
      return recognition;
  }
  
  recognition = createRecognition();
  
  // Adiciona evento de clique ao botão
  button.addEventListener('click', () => {
      if (!recognition) return;
      toggleListening();
  });
  
  // Adiciona evento de clique ao botão limpar
  limparButton.addEventListener('click', () => {
      limparPictogramDiv();
  });
  
  // Função para alternar estado de escuta
  function toggleListening() {
      if (recognition.start) {
          recognition.start();
      } else if (recognition.listen) { // annyang usa o método listen
          recognition.listen();
      }
  }
  

// Function to search for pictograms based on recognized phrase
function buscarPictogramas(frase) {
    const palavras = frase.split(' ');
    pictogramUrls = []; // Limpar o array de URLs antes de adicionar novos pictogramas
    palavras.forEach(palavra => {
        $.ajax({
            url: "https://api.arasaac.org/v1/pictograms/pt/search/" + palavra,
            type: "GET",
            beforeSend: function(xhr) {
                const token = "SEU_TOKEN_JWT_AQUI";
                xhr.setRequestHeader("Authorization", "Bearer " + token);
            },
            success: function(data) {
                if (data && data.length > 0) {
                    const pictogramId = data[0]._id;
                    const imageUrl = `https://api.arasaac.org/api/pictograms/${pictogramId}`;
                    pictogramUrls.push(imageUrl); // Adicionar o URL do pictograma ao array
                    exibirPictogramas();
                } else {
                    $('#pictogramDiv').append(`<p>Nenhum pictograma encontrado para a palavra "${palavra}".</p>`);
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.log("Erro ao buscar pictograma:", textStatus);
            }
        });
    });
}

// Function to display pictograms in pictogramDiv
function exibirPictogramas() {
    limparPictogramDiv(); // Limpar a div antes de adicionar novos pictogramas
    pictogramUrls.forEach(url => {
        const img = document.createElement('img');
        img.src = url;
        img.alt = "Pictograma";
        img.width = 100;
        img.height = 100;
        img.className = "pictogram";
        document.getElementById('pictogramDiv').appendChild(img);
    });
}

// Function to clear the pictogramDiv
function limparPictogramDiv() {
    $('#pictogramDiv').empty();
}