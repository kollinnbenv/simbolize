document.addEventListener('DOMContentLoaded', () => {
    const formFrase = document.getElementById('formFrase');
    const resultadoDiv = document.getElementById('resultado');

    formFrase.addEventListener('submit', async (event) => {
        event.preventDefault();
        
        const frase = document.getElementById('frase').value;
        const url = `/analyze?frase=${encodeURIComponent(frase)}`;

        try {
            const response = await fetch(url);
            const data = await response.json();

            resultadoDiv.innerHTML = `<p>Contexto retornado: ${data.contexto}</p>`;
        } catch (error) {
            console.error('Erro ao analisar a frase:', error);
            resultadoDiv.innerHTML = `<p>Ocorreu um erro ao analisar a frase.</p>`;
        }
    });
});
