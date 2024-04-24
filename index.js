/* vars 
- canvas : tela
- ctx : contexto
- ALTURA
- LARGURA
- frames : taxa de quadros
*/
var canvas, ctx, ALTURA, LARGURA,  estadoAtual, recorde, img, altBloco,

maxPulos = 3, 
velocidade = 8,
gravidade = 1.567,
forcaDoPulo = 27,
vidasInicial = 5,
faseAtual = 0,
// forcaDoPulo: 23.6,

pontosParaNovaFase = [15, 30, 50, 80, 120, 150, 190, 250, 400, 500, 750, 1000, 1250, 1500, 2000, 2500, 3500],

labelNovaFase = {
    texto: "",
    opacidade: 0.0,
    fadeIn: function(dt){
        var fadeInId = setInterval(function() {
            if(labelNovaFase.opacidade < 1.0){
                labelNovaFase.opacidade += 0.01;
            }else{
                clearInterval(fadeInId);
            }
        }, 10 * dt);
    },
    fadeOut: function(dt){
        var fadeOutId = setInterval(function() {
            if(labelNovaFase.opacidade > 0.0){
                labelNovaFase.opacidade -= 0.01;
            }else{
                clearInterval(fadeOutId);
            }
        }, 10 * dt);
    }
},

estados = {
    jogar: 0,
    jogando: 1,
    perdeu: 2
},

chao = {
    y: 550,
    x: 0,
    altura: 50,
    atualiza: function(){
        this.x -= velocidade;
        if(this.x <= -40){
            this.x += 36;
        }
    },
    desenha: function () {
        spriteChao.desenha(this.x, this.y);
        spriteChao.desenha(this.x + spriteChao.largura, this.y);
    }
},                

bloco = {
    x: 50,
    y: 0,
    altura: spriteBoneco.altura,
    largura: spriteBoneco.largura,
    gravidade: gravidade,
    forcaDoPulo: forcaDoPulo,
    vidas: vidasInicial,
    velocidade: 0,
    quantPulos: 0,
    score: 0,
    rotacao: 0,
    colidindo: false,
    atualiza: function () {
        this.velocidade += this.gravidade;
        this.y += this.velocidade;
        this.rotacao += Math.PI / 180 * velocidade;

        if (this.y > chao.y - this.altura && estadoAtual != estados.perdeu) {
            this.y = chao.y - this.altura;
            this.quantPulos = 0;
            this.velocidade = 0;
        }
    },
    pula: function (sound = true) {
        if (this.quantPulos < maxPulos) {
            this.velocidade = -this.forcaDoPulo;
            this.quantPulos++;

            //--------------------------------------------
            if(sound){
                playSound('sounds/jump.mp3', 0.7)
            }
            //--------------------------------------------

        }
    },
    reset: function () {
        this.velocidade = 0;
        this.y = 0;

        if (this.score > recorde) {
            localStorage.setItem("recorde", this.score);
            recorde = this.score;
        }

        this.vidas = vidasInicial;
        this.score = 0;

        velocidade = 8;
        this.gravidade = 1.567;
        faseAtual = 0;
    },
    desenha: function () {

        var sprite;

        if(faseAtual <= 4){
            sprite = spriteBoneco;
        }else{
            sprite = spriteCheirado;                            
        }

        if(this.colidindo == true){
            sprite = spriteBonecoDano;
        }

        ctx.save();
        //Operações para Rotacionar
        ctx.translate(this.x + sprite.largura/2, this.y + sprite.altura/2);
        ctx.rotate(this.rotacao);
        sprite.desenha(-sprite.largura/2, -sprite.altura/2);                        
        ctx.restore();


        // // Desenha a bolinha no canvas
        // ctx.beginPath();
        // //Ponto alto frente
        // ctx.arc((this.x + this.largura), this.y, 5, 0, 2 * Math.PI);
        // //Ponto baixo frente
        // ctx.arc((this.x + this.largura), this.y + this.altura, 5, 0, 2 * Math.PI);
        // //Ponto alto traseiro
        // ctx.arc((this.x), this.y, 5, 0, 2 * Math.PI);
        // //Ponto baixo traseiro
        // ctx.arc((this.x), this.y + this.altura, 5, 0, 2 * Math.PI);
        // ctx.fillStyle = "red"; // Cor de preenchimento da bolinha
        // ctx.fill();
        // ctx.closePath();
    },
    colidiu: function () {
        bloco.colidindo = true;

        setTimeout(function(){
            bloco.colidindo = false;
        }, 500);

        playSound('sounds/hit.mp3')

        if(bloco.vidas >=1){
            bloco.vidas--;
        }else{
            estadoAtual = estados.perdeu;
            sons.music.pause()
            playSound('sounds/loose.mp3')
        }
    },
    pontua: function (entity, qtdePT = 1) {
        entity._scored = true

        this.score+=qtdePT;

        let phasePoints = findCurrentPhase(this.score)

        if(faseAtual != phasePoints){
            passarDeFase();
        }

        //console.log(findCurrentPhase(this.score))


        // if(faseAtual < pontosParaNovaFase.length 
        // && this.score == pontosParaNovaFase[faseAtual]){
        //     passarDeFase();
        // }
    },
    ganhaVida: function (life) {
        if(!life._scored){
            playSound('sounds/took_life.mp3')
            bloco.vidas++
        }
    }
},

obstaculos = {
    _obs: [],
    _scored: false,
    _sprites: [
        obstaculoAzul,
        obstaculoVerde,
        obstaculoVermelho,
        obstaculoAmarelo,
        obstaculoRoxo,
        obstaculoMarrom,
        obstaculoCinza
    ],
    tempoInsercao: 0,
    insere: function () {

        if(faseAtual <= 4){
            altBloco = 100;
        }else if (altBloco > 4){
            altBloco = 200;
        }

        this._obs.push({
            x: LARGURA, 
            y: chao.y - Math.floor(20 + Math.random() * altBloco),                           
            largura: 50,
            sprite: this._sprites[Math.floor(this._sprites.length * Math.random())]
        });

        this.tempoInsercao = 30 + Math.floor(60 * Math.random());
    },
    atualiza: function () {

        if (this.tempoInsercao == 0) {
            this.insere();
        } else {
            this.tempoInsercao--;
        }

        for (var i = 0, tam = this._obs.length; i < tam; i++) {
            var obs = this._obs[i];

            obs.x -= velocidade;
            if (
                !bloco.colidindo
                && bloco.x < obs.x + obs.largura
                && bloco.x + bloco.largura >= obs.x
                && bloco.y + bloco.altura >= obs.y
            ) {
                
                bloco.colidiu()

            } else if (obs.x <= 0 && !obs._scored) {

                bloco.pontua(obs)
                // bloco.score++;
                // obs._scored = true;  

                // if(faseAtual < pontosParaNovaFase.length 
                // && bloco.score == pontosParaNovaFase[faseAtual]){
                //     passarDeFase();
                // }

            } else if (obs.x <= -obs.largura) {
                this._obs.splice(i, 1);
                tam--;
                i--;
            }
        }
    },
    limpa: function () {
        this._obs = [];
    },
    desenha: function () {
        for (var i = 0, tam = this._obs.length; i < tam; i++) {
            var obs = this._obs[i];
            obs.sprite.desenha(obs.x, obs.y);
        }
    }
},

voadores = {
    _fly: [],
    _sprites: [
        voador1,
    ],
    _brokenSprites: {
        voador1Quebrado
    },
    _scored: false,
    tempoInsercao: 0,
    insere: function () {

        this._fly.push({
            x: LARGURA, 
            y: chao.y - Math.floor(250 + Math.random() * 200),                           
            largura: voador1.largura,
            altura: voador1.altura,
            sprite: this._sprites[Math.floor(this._sprites.length * Math.random())]
        });

        this.tempoInsercao = 30 + Math.floor(800 * Math.random());
    },
    atualiza: function () {

        if (this.tempoInsercao == 0) {
            this.insere();

            //--------------------------------------------
            playSound('sounds/plane.mp3')
            //--------------------------------------------

        } else {
            this.tempoInsercao--;
        }

        for (var i = 0, tam = this._fly.length; i < tam; i++) {
            var fly = this._fly[i];
            fly.x -= velocidade;

            // Verificar colisão com o voador
            if (
            !bloco.colidindo
            && fly.x > -100
            && bloco.x + bloco.largura >= fly.x 
            && bloco.x <= fly.x
            && bloco.y + (bloco.altura/2) >= fly.y 
            && bloco.y <= fly.y + fly.altura) {
                // Colisão na frente do fly
                //console.log(`Colidiu com voador ${i}`)
                if(faseAtual < 5){
                    bloco.colidiu()
                }
                if(!bloco.colidindo){
                    this.destroi(fly)
                }
                
            }


            if (!bloco.colidindo 
            && bloco.x + bloco.largura >= fly.x 
            && bloco.x <= fly.x + fly.largura 
            && bloco.y <= fly.y 
            && bloco.y + bloco.altura >= fly.y) {
                // Colisão no topo do fly
                //console.log('colisão no topo')
                
                if(!fly._scored){
                    bloco.pontua(fly, 5)
                }
                this.destroi(fly)
                
                // if(faseAtual < pontosParaNovaFase.length 
                // && bloco.score == pontosParaNovaFase[faseAtual]){
                //     passarDeFase();
                // }
                //console.log(`O personagem está no nível ${nivelAtual}`);
            }

            if (fly._scored && fly.x <= -100) {
                this._fly.splice(i, 1);
                tam--;
                i--;
            }
        }
    },
    limpa: function () {
        this._fly = [];
    },
    desenha: function () {
        for (var i = 0, tam = this._fly.length; i < tam; i++) {
            var fly = this._fly[i];
            fly.sprite.desenha(fly.x, fly.y);
        }
    },
    destroi: function (fly) {

        playSound('sounds/explosion.mp3')

        bloco.pula(false)
        bloco.quantPulos = 0
        fly.sprite = this._brokenSprites['voador1Quebrado']
        fly.velocidade++

        setInterval(() => {
            if(fly.y <= 500){
                fly.y++
            }
        }, 1)  
    }
},

vida = {
    _lifes: [],
    sprite: vidaSPR,
    _scored: false,
    tempoInsercao: 9,
    insere: function () {
        this._lifes.push({
            x: LARGURA, 
            y: chao.y - Math.floor(250 + Math.random() * 200),                           
            largura: vidaSPR.largura,
            altura: vidaSPR.altura,
            sprite: vidaSPR
        });

        this.tempoInsercao = 500 + Math.floor(800 * Math.random());
    },
    atualiza: function () {

        if (this.tempoInsercao == 0) {
            this.insere();

            //--------------------------------------------
            playSound('sounds/life_spawn.mp3')
            //--------------------------------------------

        } else {
            this.tempoInsercao--;
        }

        for (var i = 0, tam = this._lifes.length; i < tam; i++) {
            var life = this._lifes[i];
            life.x -= velocidade;

            if (
                (bloco.x + bloco.largura) > life.x
                && (bloco.x + bloco.largura) < (life.x + life.largura)
                && (bloco.y + bloco.altura) > life.y
                && (bloco.y + bloco.altura) < (life.y + life.altura)
            ) {
                // Ganha Vida
                bloco.ganhaVida(life)
                life._scored = true

                life.sprite = vida2SPR

                setTimeout(() => {
                    life.sprite = vida3SPR
                }, 100);
                setTimeout(() => {
                    life.sprite = vida4SPR
                }, 200);
                setTimeout(() => {
                    life.sprite = vida5SPR
                }, 300);

                setTimeout(() => {
                    this._lifes.splice(i, 1);
                    tam--;
                    i--;
                }, 400);
            }


            if (life.x <= -100) {
                this._lifes.splice(i, 1);
                tam--;
                i--;
            }
        }
    },
    limpa: function () {
        this._lifes = [];
    },
    desenha: function () {
        for (var i = 0, tam = this._lifes.length; i < tam; i++) {
            var life = this._lifes[i];
            life.sprite.desenha(life.x, life.y);
        }
    },
}

sons = {
    lobby: new Audio('sounds/lobby.mp3'),
    start_game: new Audio('sounds/start_game.mp3'),
    music: new Audio('sounds/music.mp3'),
    phase_advanced: new Audio('sounds/phase_advanced.mp3'),
    jump: new Audio('sounds/jump.mp3'),
    explosion: new Audio('sounds/explosion.mp3'),
    loose: new Audio('sounds/loose.mp3'),
    hit: new Audio('sounds/hit.mp3'),
    plane: new Audio('sounds/plane.mp3'),
    life_spawn: new Audio('sounds/life_spawn.mp3'),
    took_life: new Audio('sounds/took_life.mp3'),
}

function main(){
    document.getElementById('btn').addEventListener('click', () => {
        loadGame()
    })
}

function loadGame(){
    
    //--------------------------------------------
    sons.lobby.volume = 0.4
    sons.lobby.play()
    //--------------------------------------------

    localStorage.removeItem("recorde");

    ALTURA = window.innerHeight;
    LARGURA = window.innerWidth;

    if (LARGURA >= 500) {
        LARGURA = 800;
        ALTURA = 600;
    }

    canvas = document.createElement("canvas");
    canvas.width = LARGURA;
    canvas.height = ALTURA;
    canvas.style.border = "1px solid";

    ctx = canvas.getContext("2d");

    document.body.appendChild(canvas);
    document.addEventListener("mousedown", clique);

    estadoAtual = estados.jogar;
    recorde = localStorage.getItem("recorde");

    if (recorde == null) {
        recorde = 0;
    }

    img = new Image();
    img.src = "imgs/sheet.png";

    loop();
}

function loop() {

    atualiza();
    desenha();

    window.requestAnimationFrame(loop);
}

function atualiza() {
    chao.atualiza();
    bloco.atualiza();

    //console.log(bloco.colidindo)

    if (estadoAtual == estados.jogando) {
        obstaculos.atualiza();
        voadores.atualiza();
        vida.atualiza();
    } 
}

function desenha() {

    bg.desenha(0,0); 

    drawHudText(`Pontos: ${bloco.score}`, 25, 68)
    drawHudText(`Vidas: ${bloco.vidas}`, 580, 68)
    drawHudText(labelNovaFase.texto, 0, 0, labelNovaFase.opacidade, true)

    if(estadoAtual == estados.jogando){
        obstaculos.desenha();
        voadores.desenha();
        vida.desenha();
    }

    chao.desenha();               
    bloco.desenha();                 

    if(estadoAtual == estados.jogar){
        jogar.desenha(LARGURA / 2 - jogar.largura/2, ALTURA / 2 - jogar.altura/2)
    }

    if(estadoAtual == estados.perdeu){
        perdeu.desenha(LARGURA / 2 - perdeu.largura/2, ALTURA / 2 - perdeu.altura/2 - spriteRecorde.altura/2);

        spriteRecorde.desenha(LARGURA / 2 - spriteRecorde.largura/2, ALTURA / 2 + perdeu.altura/2 - spriteRecorde.altura/2);
    
        // ctx.fillText(bloco.score, 450, 380);
        drawHudText(bloco.score, 450, 380)
        
        if(bloco.score > recorde){
            novo.desenha(LARGURA / 2 - 130, ALTURA / 2 + 10);
            // ctx.fillText(bloco.score, 460, 480);
            drawHudText(bloco.score, 460, 480)
        }else{
            // ctx.fillText(recorde, 460, 480);
            drawHudText(recorde, 460, 480)
        }
    }
}

function passarDeFase(fase = null){

    //--------------------------------------------
    playSound('sounds/phase_advanced.mp3')
    //--------------------------------------------

    velocidade++;
    fase ? faseAtual = fase : faseAtual++;
    bloco.vidas++;

    if(faseAtual == 5){
        bloco.gravidade *= 0.6;
    }

    labelNovaFase.texto = "Level " + faseAtual;
    labelNovaFase.fadeIn(0.4);

    setTimeout(function() {
        labelNovaFase.fadeOut(0.4);
    }, 800);
    
}

function clique() {
    if (estadoAtual == estados.jogando) {
        bloco.pula();
    } else if (estadoAtual == estados.jogar) {

        //--------------------------------------------
        sons.lobby.pause()
        playSound('sounds/start_game.mp3')
        sons.music.play()
        sons.music.addEventListener('ended', () => {
            sons.music.play();
        })
        //--------------------------------------------

        estadoAtual = estados.jogando;
    } else if (estadoAtual == estados.perdeu && bloco.y >= 2 * ALTURA) {

        //--------------------------------------------
        sons.lobby.play()
        //--------------------------------------------

        estadoAtual = estados.jogar;
        obstaculos.limpa();
        bloco.reset();
    }
    
}

function playSound(path, volume = null){
    let sound = new Audio(path)

    if(volume){
        sound.volume = volume
    }

    sound.play()
}

function drawHudText(text, x, y, opacity = 1, middle = false){
    // Salvar o estado atual do contexto
    ctx.save();

    ctx.strokeStyle = `rgba(84, 84, 84, ${opacity})`;
    ctx.lineWidth = 1;
    ctx.font = "50px Arial";
    ctx.fillStyle = `rgba(241, 241, 241, ${opacity})`;

    if(middle){
        ctx.fillText(text, canvas.width/2 - ctx.measureText(text).width/2, canvas.height/3);
        ctx.strokeText(text, canvas.width/2 - ctx.measureText(text).width/2, canvas.height/3);    
    }else{
        ctx.fillText(text, x, y);
        ctx.strokeText(text, x, y);
    }
    
    

    // Restaurar o estado do contexto
    ctx.restore();
}


function findCurrentPhase(pontos) {
    for (let i = 0; i < pontosParaNovaFase.length; i++) {
      if (pontos < pontosParaNovaFase[i]) {
        return i;
      }
    }
    // Se ultrapassar todos os limites, está na última fase
    return pontosParaNovaFase.length;
}
  
window.onload = (event) => main()