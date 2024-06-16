from flask import Flask, render_template, jsonify, request
import speech_recognition as sr

app = Flask(__name__)

# Rota principal para renderizar a página HTML
@app.route('/')
def index():
    return render_template('index.html')

# Rota para ouvir o microfone e reconhecer a fala
@app.route('/ouvir_microfone', methods=['POST'])
def ouvir_microfone():
    try:
        # Inicializa o reconhecedor de fala
        microfone = sr.Recognizer()

        # Usa o microfone como fonte de áudio
        with sr.Microphone() as source:
            # Ajusta para o ruído ambiente captado pelo microfone
            microfone.adjust_for_ambient_noise(source, duration=0.5)

            # Escuta o áudio do microfone
            audio = microfone.listen(source)

        # Usa o Google para reconhecer o áudio capturado
        frase = microfone.recognize_google(audio, language='pt-BR')
        print("Você disse: " + frase)
        return jsonify({'frase': frase})
    
    except sr.UnknownValueError:
        # Captura a exceção caso o reconhecimento não consiga entender o áudio
        print("Não entendi")
        return jsonify({'frase': ''})

# Roda a aplicação Flask
if __name__ == '__main__':
    app.run(debug=True)
