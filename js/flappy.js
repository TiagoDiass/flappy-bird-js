//função que será usada pra criar elementos, assim aumentando nossa produtividade
function novoElemento(tagName, className){
    const element = document.createElement(tagName)
    element.className = className

    return element
}

//Metódo construtor
function Barreira(reversa = false){
    this.elemento = novoElemento('div', 'barreira')   
    
    const borda = novoElemento('div', 'borda')
    const corpo = novoElemento('div', 'corpo')
    this.elemento.appendChild(reversa ? corpo : borda)
    this.elemento.appendChild(reversa ? borda : corpo)

    //definir altura
    this.SetAltura = altura => corpo.style.height = `${altura}px`
}

function ParDeBarreiras(altura, abertura, PosicaoX){
    this.elemento = novoElemento('div', 'par-de-barreiras')
    
    this.superior = new Barreira(true) // barreira reversa
    this.inferior = new Barreira(false)

    this.elemento.appendChild(this.superior.elemento)
    this.elemento.appendChild(this.inferior.elemento)

    this.sortearAbertura = () => {
        const alturaSuperior = Math.random() * (altura-abertura)
        const alturaInferior = altura - abertura - alturaSuperior
        this.superior.SetAltura(alturaSuperior)
        this.inferior.SetAltura(alturaInferior)
    }

    this.getX = () => parseInt(this.elemento.style.left.split('px')[0])
    this.setX = PosicaoX => this.elemento.style.left = `${PosicaoX}px`
    this.getLargura = () => this.elemento.clientWidth

    this.sortearAbertura()
    this.setX(PosicaoX)
}

function Barreiras(altura, largura, abertura, espaco, notificarPonto){
    //Pares de barreiras
    this.pares = [
        new ParDeBarreiras(altura, abertura, largura),
        new ParDeBarreiras(altura, abertura, largura + espaco),
        new ParDeBarreiras(altura, abertura, largura + espaco * 2),
        new ParDeBarreiras(altura, abertura, largura + espaco * 3)
    ]

    // quantos pixels será o deslocamento das animações
    const deslocamento = 3
    this.animar = () => {
        this.pares.forEach(par => {
            par.setX(par.getX() - deslocamento)

            //quando o elemento sair da área do jogo
            if(par.getX() < -par.getLargura()){
                par.setX(par.getX() + espaco * this.pares.length)
                par.sortearAbertura() //Sortear abertura das novas barreiras
            }

            const meio = largura / 2
            const cruzouOMeio = par.getX() + deslocamento >= meio 
                && par.getX() < meio
            if(cruzouOMeio) notificarPonto()
        })
    }
}

function Passaro(alturaJogo){
    let voando = false

    this.elemento = novoElemento('img', 'passaro')
    this.elemento.src = 'imgs/passaro.png'

    this.getY = () => parseInt(this.elemento.style.bottom.split('px')[0])
    this.setY = y => this.elemento.style.bottom = `${y}px`
    
    window.onkeydown = evento => voando = true
    window.onkeyup = evento => voando = false

    this.animar = () => {
        const novoY = this.getY() + (voando ? 8 : -6)
        const alturaMaxima = alturaJogo - this.elemento.clientHeight

        if(novoY <= 0){
            this.setY(0)
        }else if(novoY >= alturaMaxima){
            this.setY(alturaMaxima)
        }else{
            this.setY(novoY)
        }
    }

    this.setY(alturaJogo / 2)
}

function Progresso() {
    this.elemento = novoElemento('span', 'progresso')
    this.atualizarPontos = pontos => {
        this.elemento.innerHTML = pontos
    }
    this.atualizarPontos(0)
}

function estaoSobrepostos(elementoA, elementoB){
    const a = elementoA.getBoundingClientRect()
    const b = elementoB.getBoundingClientRect()

    const horizontal = a.left + a.width >= b.left
        && b.left + b.width >= a.left
    const vertical = a.top + a.height >= b.top
        && b.top + b.height >= a.top
    return horizontal && vertical
}

function colidiu(passaro, barreiras){
    let colidiu = false
    barreiras.pares.forEach(ParDeBarreiras => {
        if(!colidiu){
            const superior = ParDeBarreiras.superior.elemento
            const inferior = ParDeBarreiras.inferior.elemento
            colidiu = estaoSobrepostos(passaro.elemento, superior)
                || estaoSobrepostos(passaro.elemento, inferior)
        }
    })
    return colidiu
}

function FlappyBird(){
    let pontos = 0

    const areaDoJogo = document.querySelector('[wm-flappy]')
    const altura = areaDoJogo.clientHeight
    const largura = areaDoJogo.clientWidth

    const progresso = new Progresso()
    const barreiras = new Barreiras(altura, largura, 200, 400,
        () => progresso.atualizarPontos(++pontos))
    const passaro = new Passaro(altura)

    areaDoJogo.appendChild(progresso.elemento)
    areaDoJogo.appendChild(passaro.elemento)
    barreiras.pares.forEach(par => areaDoJogo.appendChild(par.elemento))

    this.start = () => {
        //loop do jogo
        const temporizador = setInterval(() => {
            barreiras.animar()
            passaro.animar()

            if(colidiu(passaro, barreiras)){
                clearInterval(temporizador)
                popUpGameOver(pontos)
            }
        }, 20)
    }
}

let game = document.querySelector('[wm-flappy]')

function popUpGameOver(pontuacao){
    
    if(pontuacao === 0){
        game.insertAdjacentHTML('afterend', 
        `<div class="gameOver">
            <h1>
                Que pena, você não conseguiu passar por nenhuma barreira, tente novamente!    
            </h1>
            <div class="jogarNovamente">
                <h1><a href="index.html">Jogar novamente</a></h1>
            </div>
        </div>`)
    }
    else if(pontuacao <= 5){
        game.insertAdjacentHTML('afterend', 
        `<div class="gameOver">
            <h1>Que pena, você morreu, mas conseguiu passar por ${pontuacao} barreiras!</h1>
            <div class="jogarNovamente">
                <h1><a href="index.html">Jogar novamente</a></h1>
            </div>
        </div>`)
    }else if(pontuacao > 5 ){
        game.insertAdjacentHTML('afterend', 
        `<div class="gameOver">
            <h1>Boa, você conseguiu passar por ${pontuacao} barreiras</h1>
            <div class="jogarNovamente">
                <h1><a href="index.html">Jogar novamente</a></h1>
            </div>
        </div>`)
    }
}

new FlappyBird().start()