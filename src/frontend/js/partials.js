async function loadContentInto(container, url) {
    const response = await fetch(url);
    const text = await response.text();
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = text;
    container.appendChild(tempDiv);
  }
  
  document.addEventListener('DOMContentLoaded', async () => {
    await loadContentInto(document.getElementById('header-container'), './partials/header.html');
  });
  
    // Se a tela for pequena, carregamos as outras seções no index.
    document.addEventListener('DOMContentLoaded', async () => {

        // await loadContentInto(document.getElementById('header-container'), './partials/header.html');
  
        if (window.innerWidth <= 768) {
          const mainContainer = document.getElementById('mainContainer');
    
          // Carregar as parciais de conteúdo
          await loadContentInto(mainContainer, './partials_content/projetos_content.html');
          // Agora que a parcial de projetos foi inserida no DOM, chamamos loadProjetos():
          await loadProjetos();
    
          await loadContentInto(mainContainer, './partials_content/contato_content.html');
          await loadContentInto(mainContainer, './partials_content/text_content.html');
          initializeTextScripts();
          await loadContentInto(mainContainer, './partials_content/voice_content.html');
        }
      });
    
      async function loadContentInto(container, url) {
        const response = await fetch(url);
        const text = await response.text();
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = text;
        container.appendChild(tempDiv);
      }