# Cria o diretório principal
New-Item -ItemType Directory -Path "project" -Force | Out-Null

# Cria subdiretórios
New-Item -ItemType Directory -Path "project\src" -Force | Out-Null
New-Item -ItemType Directory -Path "project\src\backend" -Force | Out-Null
New-Item -ItemType Directory -Path "project\src\backend\data" -Force | Out-Null
New-Item -ItemType Directory -Path "project\src\backend\routes" -Force | Out-Null
New-Item -ItemType Directory -Path "project\src\frontend" -Force | Out-Null
New-Item -ItemType Directory -Path "project\src\frontend\css" -Force | Out-Null
New-Item -ItemType Directory -Path "project\src\frontend\js" -Force | Out-Null
New-Item -ItemType Directory -Path "project\src\frontend\img" -Force | Out-Null

# Cria arquivos backend
New-Item -ItemType File -Path "project\src\backend\data\profissionais.json" -Force | Out-Null
New-Item -ItemType File -Path "project\src\backend\data\projetos.json" -Force | Out-Null
New-Item -ItemType File -Path "project\src\backend\routes\profissionais.js" -Force | Out-Null
New-Item -ItemType File -Path "project\src\backend\routes\projetos.js" -Force | Out-Null
New-Item -ItemType File -Path "project\src\backend\routes\contato.js" -Force | Out-Null
New-Item -ItemType File -Path "project\src\backend\server.js" -Force | Out-Null

# Cria arquivos frontend (html)
New-Item -ItemType File -Path "project\src\frontend\index.html" -Force | Out-Null
New-Item -ItemType File -Path "project\src\frontend\profissionais.html" -Force | Out-Null
New-Item -ItemType File -Path "project\src\frontend\projetos.html" -Force | Out-Null
New-Item -ItemType File -Path "project\src\frontend\contato.html" -Force | Out-Null
New-Item -ItemType File -Path "project\src\frontend\text.html" -Force | Out-Null
New-Item -ItemType File -Path "project\src\frontend\voice.html" -Force | Out-Null

# Cria arquivo css
New-Item -ItemType File -Path "project\src\frontend\css\style.css" -Force | Out-Null

# Cria arquivos js
New-Item -ItemType File -Path "project\src\frontend\js\textScript.js" -Force | Out-Null
New-Item -ItemType File -Path "project\src\frontend\js\voiceScript.js" -Force | Out-Null

# Cria arquivos img
New-Item -ItemType File -Path "project\src\frontend\img\Simbolize_horizontal.svg" -Force | Out-Null
New-Item -ItemType File -Path "project\src\frontend\img\terapeuta1.jpg" -Force | Out-Null
New-Item -ItemType File -Path "project\src\frontend\img\terapeuta2.jpg" -Force | Out-Null
New-Item -ItemType File -Path "project\src\frontend\img\terapeuta3.jpg" -Force | Out-Null
New-Item -ItemType File -Path "project\src\frontend\img\terapeuta4.jpg" -Force | Out-Null

# Cria o arquivo package.json
New-Item -ItemType File -Path "project\package.json" -Force | Out-Null
