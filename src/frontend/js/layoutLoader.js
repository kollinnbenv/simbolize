async function loadProjetos() {
  const response = await fetch('/api/projetos');
  const projetos = await response.json();
  const container = document.getElementById('projetosContainer');
  if (!container) return; // Se não existir, não faz nada

  projetos.forEach(p => {
    // Converte em array se não for array
    if (!Array.isArray(p.imagens)) {
      p.imagens = [p.imagens];
    }

    const projectCard = document.createElement('div');
    projectCard.className = 'project-card';

    const title = document.createElement('h3');
    title.textContent = p.titulo;
    
    const desc = document.createElement('p');
    desc.textContent = p.descricao;

    const gallery = document.createElement('div');
    gallery.className = 'project-gallery';

    p.imagens.forEach(imgPath => {
      const img = document.createElement('img');
      img.src = imgPath;
      img.alt = p.titulo;
      gallery.appendChild(img);
    });

    projectCard.appendChild(title);
    projectCard.appendChild(desc);
    projectCard.appendChild(gallery);
    container.appendChild(projectCard);
  });
}
