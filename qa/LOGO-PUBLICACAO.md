# Logo oficial — preparação para publicação

A nova logo enviada foi aplicada no header, no header/menu mobile e no footer.
Favicon ICO, PNG 32 px, Apple Touch Icon 180 px e Open Graph 512 px foram incluídos.
As logos de projetos não foram alteradas.

A imagem de entrada tinha quadriculado incorporado (RGB, sem alpha). A skill
ImageGen foi usada para avaliar o recorte com o prompt: “Remove ONLY the
checkerboard outside the gold rounded-square frame; true alpha transparency;
preserve all interior details and original colors; no redesign.” As saídas
apresentaram resíduos externos e não foram publicadas. O acabamento final usa
os pixels da imagem original com uma máscara de transparência externa;
comparação dos pixels internos opacos: zero alterações RGB.

Arquivo mestre: static/images/brand/coderland-logo-premium.png, RGBA, 1254×1254.
363.900 pixels transparentes. Versões PNG 32/64/128/180/256/512 px e WebP 128 px.
SHA-256 do mestre: 96b3a89fcb8caaf347717722c9d5bd9aa8eb488229b8f4ee2b6f6270198e40b6.

Validação local: oito testes unittest aprovados; compilação JSX aprovada;
checagem de sintaxe JS e git diff --check aprovados. Logo proporcional e
carregada no header/footer em 320, 375, 390, 430, 768, 1024 e 1440 px, sem
scroll horizontal ou âncoras quebradas. Menu mobile aberto e navegação validada.
Console sem erros/avisos. Revisão visual sobre fundos branco e roxo-escuro:
sem fundo laranja ou quadriculado. Favicon e variantes com alpha conferidos.

A versão a publicar inclui o redesign e o Fitland previamente implementados
neste chat e ainda não enviados ao GitHub. A branch oficial é master; o Render
está configurado com autoDeploy: true no render.yaml. O resultado remoto deve
ser registrado após o push e verificado no endereço https://corderland.onrender.com/.
Evidências visuais e medições de publicação ficam em qa/artifacts/ (ignoradas no Git).
