# 🧩 Simbolize
## 💡 Visão Geral

O Simbolize é um sistema web criado para facilitar a comunicação alternativa por meio de pictogramas do ARASAAC (portal internacional de símbolos pictográficos).
Ele permite que uma pessoa fale ou digite uma frase, e o sistema retorna os pictogramas correspondentes às palavras, ajudando na comunicação de pessoas não verbais, autistas ou com dificuldades de fala e linguagem.

Hoje, o projeto funciona de forma literal,  ele busca e exibe pictogramas de cada palavra isolada digitada ou falada, sem compreender ainda o sentido completo da frase.
Mesmo assim, ele já representa um passo importante rumo à comunicação simbólica assistiva.

## 🎯 Objetivo 

* Criar uma interface simples e acessível para testes de usabilidade.

* Permitir a entrada de texto ou fala do usuário.

* Conectar-se à API do ARASAAC para buscar pictogramas correspondentes às palavras digitadas.

* Exibir os pictogramas de forma organizada e responsiva.

* Ainda não há backend  — todo o funcionamento ocorre diretamente no navegador (HTML, CSS e JavaScript puro).

⚙️ Estrutura da Aplicação

A branch feat/simbolize contém apenas o diretório /public, com os arquivos responsáveis pela interface:
``````
public/
├── index.html      → Estrutura principal da página
├── style.css       → Estilos e layout responsivo
└── script.js   → Lógica de interação e busca na API ARASAAC 
``````


   


### Cada componente tem um papel claro:

`index.html`:
* Contém os campos de entrada de texto e o botão para busca (ou ativação por voz).

`style.css`:
* Define o layout limpo, com foco em acessibilidade visual, contraste e tamanho ajustável dos pictogramas.

`script.js`:
* Contém a lógica de:

* Capturar o texto (ou fala) do usuário.

* Dividir a frase em palavras.

* Consultar a API pública do ARASAAC.

* Exibir as imagens correspondentes em sequência.

## 🔗 Integração com a API do ARASAAC

A aplicação utiliza a API pública do ARASAAC para buscar pictogramas.
Cada palavra da frase é tratada individualmente e consultada na API.

### Exemplo de requisição:

`GET https://api.arasaac.org/api/pictograms/{lang}/{searchTerm}`


Onde:

`{lang}` define o idioma (por exemplo: pt ou es).

`{searchTerm}` é a palavra buscada.

O retorno é uma lista de pictogramas relacionados à palavra, e o sistema exibe o primeiro resultado como representação visual.

## 💻 Como Executar o Projeto Localmente

Como o Simbolize é um frontend puro, não é necessário instalar dependências nem rodar servidor.

### Passos:

#### Baixe ou clone o projeto:

``git clone https://github.com/kollinnbenv/simbolize.git``


Vá até a branch correta:

`git checkout feat/simbolize`


Abra o arquivo `public/index.html` diretamente no navegador.

✨ Pronto! O sistema funcionará localmente, fazendo chamadas diretas à API do ARASAAC.

## 🧠 Fluxo de Funcionamento

* O usuário digita ou fala uma frase.

* O sistema divide a frase em palavras separadas.

* Cada palavra é enviada à API do ARASAAC.

* O sistema recebe e exibe os pictogramas de cada palavra.

* O resultado é uma sequência visual que ajuda na compreensão da mensagem.

> 🗣️ Exemplo:
Frase: “Eu quero água”
Retorno: pictogramas de eu → querer → água

# 🚀 Próximos Passos (Planejados)

A versão atual é o primeiro passo para um sistema mais inteligente.
Os próximos objetivos incluem:

* 🤖 Inserir Inteligência Artificial para compreender o sentido completo da frase e escolher pictogramas com contexto semântico, não apenas literais.


❤️ Propósito Social

O Simbolize nasce como uma ferramenta de acessibilidade comunicacional.
Seu objetivo é reduzir barreiras de comunicação para pessoas autistas, não verbais ou com dificuldades de fala, permitindo que suas ideias sejam traduzidas em símbolos compreensíveis para todos.

Mais do que um projeto técnico, o Simbolize é uma ponte entre mundos:
a tecnologia e a linguagem humana em todas as suas formas.