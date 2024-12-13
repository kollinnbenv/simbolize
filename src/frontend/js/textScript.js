function initializeTextScripts() {
  const textInputEl = document.getElementById('textInput');
  const searchButtonEl = document.getElementById('searchButton');
  const clearButtonEl = document.getElementById('clearButton');
  const pictogramsEl = document.getElementById('pictograms');

  // Verifica se todos os elementos foram encontrados
  if (textInputEl && searchButtonEl && clearButtonEl && pictogramsEl) {
    textInputEl.addEventListener('keydown', function(event) {
      if (event.key === 'Enter') {
        searchButtonEl.click();
      }
    });

    searchButtonEl.addEventListener('click', async function() {
      const textInput = textInputEl.value.trim();
      if (textInput) {
        await processText(textInput);
      }
    });

    clearButtonEl.addEventListener('click', function() {
      textInputEl.value = '';
      pictogramsEl.innerHTML = '';
    });
  } else {
    console.error("Não foi possível encontrar um dos elementos (textInput, searchButton, clearButton ou pictograms). Verifique se o conteúdo foi carregado antes do script.");
  }
}

async function processText(text) {
  const pictogramsContainer = document.getElementById('pictograms');
  if (!pictogramsContainer) {
    console.error("Elemento 'pictograms' não encontrado.");
    return;
  }
  
  pictogramsContainer.innerHTML = ''; 

  const ignoreWords = ['a', 'o', 'e', 'na', 'no'];
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

// Chame a função de inicialização quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
  initializeTextScripts();
});