# Use uma imagem base do Python que inclua pip
FROM python:3.12

# Defina o diretório de trabalho dentro do contêiner
WORKDIR /app

# Instale dependências do sistema necessárias para compilar pyaudio
RUN apt-get update && \
    apt-get install -y python3-pyaudio portaudio19-dev gcc && pip install gunicorn

# Copie os arquivos locais para o contêiner
COPY  . .

# Instale as dependências do Python
RUN pip install --upgrade pip && \
    pip install Flask SpeechRecognition pyaudio

# Expõe a porta 5000, que é a porta em que o Flask roda por padrão
EXPOSE 5000

# Comando para rodar a aplicação com Gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "app:app"]
