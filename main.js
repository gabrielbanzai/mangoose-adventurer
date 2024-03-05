/* vars 
- canvas : tela
- ctx : contexto
- ALTURA
- LARGURA
- frames : taxa de quadros
*/
var canvas, ctx, ALTURA, LARGURA, maxPulos = 3, velocidade = 8, estadoAtual, recorde, img, altBloco,

pontosParaNovaFase = [15, 30, 50, 80, 120, 150, 190, 250, 400, 500],

faseAtual = 0,

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
            this.x += 40;
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
    gravidade: 1.567,
    velocidade: 0,
    forcaDoPulo: 23.6,
    quantPulos: 0,
    score: 0,
    rotacao: 0,
    vidas: 5,
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
    pula: function () {
        if (this.quantPulos < maxPulos) {
            this.velocidade = -this.forcaDoPulo;
            this.quantPulos++;
            sons.jump.play()
        }
    },
    reset: function () {
        this.velocidade = 0;
        this.y = 0;

        if (this.score > recorde) {
            localStorage.setItem("recorde", this.score);
            recorde = this.score;
        }

        this.vidas = 3;
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


        // Desenha a bolinha no canvas
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

        sons.hit.play()

        if(bloco.vidas >=1){
            bloco.vidas--;
        }else{
            estadoAtual = estados.perdeu;
            sons.music.pause()
            sons.loose.play()
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
                bloco.score++;
                obs._scored = true;  

                if(faseAtual < pontosParaNovaFase.length 
                && bloco.score == pontosParaNovaFase[faseAtual]){
                    passarDeFase();
                }

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
            sons.plane.play()
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
                bloco.colidiu()
                this.destroi(fly)
                
            }


            if (!bloco.colidindo 
            && bloco.x + bloco.largura >= fly.x 
            && bloco.x <= fly.x + fly.largura 
            && bloco.y <= fly.y 
            && bloco.y + bloco.altura >= fly.y) {
                // Colisão no topo do fly
                //console.log('colisão no topo')
                this.destroi(fly)
                this.pontua(fly)
                
                if(faseAtual < pontosParaNovaFase.length 
                && bloco.score == pontosParaNovaFase[faseAtual]){
                    passarDeFase();
                }
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

        sons.explosion.play()

        bloco.pula()
        bloco.quantPulos = 0
        fly.sprite = this._brokenSprites['voador1Quebrado']
        fly.velocidade++

        setInterval(() => {
            if(fly.y <= 500){
                fly.y++
            }
        }, 1)  
    },
    pontua: function (fly) {
        fly._scored = true
        bloco.score ++
    }
},

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
}

function main(){
    document.getElementById('btn').addEventListener('click', () => {
        loadGame()
    })
}

function loadGame(){
    sons.lobby.play()
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
    } 
}

function desenha() {

    bg.desenha(0,0);               

    ctx.fillStyle = "#333";
    ctx.font = "50px Arial";
    ctx.fillText(bloco.score, 30, 68);
    ctx.fillText(bloco.vidas, 740, 68);

    ctx.fillStyle = "rgba(0, 0, 0, "+ labelNovaFase.opacidade +")";
    ctx.fillText(labelNovaFase.texto, canvas.width/2 - ctx.measureText(labelNovaFase.texto).width/2, canvas.height/3);

    if(estadoAtual == estados.jogando){
        obstaculos.desenha();
        voadores.desenha();
    }

    chao.desenha();               
    bloco.desenha();                 

    if(estadoAtual == estados.jogar){
        jogar.desenha(LARGURA / 2 - jogar.largura/2, ALTURA / 2 - jogar.altura/2)
    }

    if(estadoAtual == estados.perdeu){
        perdeu.desenha(LARGURA / 2 - perdeu.largura/2, ALTURA / 2 - perdeu.altura/2 - spriteRecorde.altura/2);

        spriteRecorde.desenha(LARGURA / 2 - spriteRecorde.largura/2, ALTURA / 2 + perdeu.altura/2 - spriteRecorde.altura/2);
    
        ctx.fillText(bloco.score, 450, 380);
        ctx.fillStyle = "#fff";

        if(bloco.score > recorde){
            novo.desenha(LARGURA / 2 - 130, ALTURA / 2 + 10);
            ctx.fillText(bloco.score, 460, 480);
        }else{
            ctx.fillText(recorde, 460, 480);
        }
    }
}

function passarDeFase(fase = null){
    sons.phase_advanced.play()
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

function clique(evento) {
    if (estadoAtual == estados.jogando) {
        bloco.pula();
    } else if (estadoAtual == estados.jogar) {
        sons.lobby.pause()
        sons.start_game.play()
        sons.music.play()
        sons.music.addEventListener('ended', () => {
            sons.music.play();
        })
        estadoAtual = estados.jogando;
    } else if (estadoAtual == estados.perdeu && bloco.y >= 2 * ALTURA) {
        sons.lobby.play()
        estadoAtual = estados.jogar;
        obstaculos.limpa();
        bloco.reset();
    }
    
}
  
window.onload = (event) => main()