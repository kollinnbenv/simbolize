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
const recognition = createRecognition();
let pictogramUrls = [];

// Add click event listener to the button
button.addEventListener('click', () => {
    if (!recognition) return;
    toggleListening();
});

// Add click event listener to the limparButton
limparButton.addEventListener('click', () => {
    limparPictogramDiv();
});

// Function to toggle listening state
function toggleListening() {
    recognition.start();
}

// Function to create speech recognition
function createRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = SpeechRecognition !== undefined ? new SpeechRecognition() : null;

    if (!recognition) {
        alert("Reconhecimento de fala não suportado neste navegador.");
        return null;
    }

    recognition.lang = "pt_BR";
    recognition.onstart = () => console.log('Iniciou reconhecimento de fala');
    recognition.onend = () => console.log('Encerrou reconhecimento de fala');
    recognition.onerror = e => console.log('Erro no reconhecimento de fala:', e);
    recognition.onresult = e => {
        const fraseReconhecida = Array.from(e.results)
            .map(result => result[0])
            .map(result => result.transcript)
            .join(' ');
        buscarPictogramas(fraseReconhecida);
    };

    return recognition;
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