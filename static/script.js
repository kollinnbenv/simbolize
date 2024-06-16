

////////////////////////////

let pictogramUrls = []; // Definir a variável global para armazenar os URLs dos pictogramas

document.getElementById('start').addEventListener('click', function() {
    fetch('/reconhecer', {
        method: 'POST',
    })
    .then(response => response.json())
    .then(data => {
        const frase = data.frase;
        document.getElementById('output').innerText = frase;
        buscarPictogramas(frase); // Buscar pictogramas com a frase reconhecida
    })
    .catch(error => {
        console.error('Erro:', error);
    });
});

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
