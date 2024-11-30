/* vars 
- canvas : tela
- ctx : context
- HEIGHT
- WIDTH
- frames : taxa de quadros
*/
var canvas, ctx, HEIGHT, WIDTH, GAME_STATE, hightscores, tile, obstacleHeight,

maxJumps = 3, 
speedBase = 8,
gravity = 1.500,
jumpStrength = 30,
startLifes = 5,
currentPhase = 0,
// jumpStrength: 23.6,
musicSelected,
continuousSoundEffect,

phasePointsEvolution = [15, 30, 50, 80, 120, 150, 190, 250, 400, 500, 750, 1000, 1250, 1500, 2000, 2500, 3500],

BASE_WIDTH = 800;
BASE_HEIGHT = 600;

//Texto de "Nova fase" aparece quando se passa de fase
newPhaseLabel = {
    text: "",
    opacity: 0.0,
    fadeIn: function(dt){
        var fadeInId = setInterval(function() {
            if(newPhaseLabel.opacity < 1.0){
                newPhaseLabel.opacity += 0.01;
            }else{
                clearInterval(fadeInId);
            }
        }, 10 * dt);
    },
    fadeOut: function(dt){
        var fadeOutId = setInterval(function() {
            if(newPhaseLabel.opacity > 0.0){
                newPhaseLabel.opacity -= 0.01;
            }else{
                clearInterval(fadeOutId);
            }
        }, 10 * dt);
    }
},

//Estados do jogo, para preparação de telas e transição de cenários
game_states = {
    play: 0,
    playing: 1,
    loose: 2
},

//Entidade do chão da fase
ground = {
    y: 550,
    x: 0,
    height: 50,
    update: function(){
        this.x -= speedBase;
        if(this.x <= -36.3){
            this.x += 36.3;
        }
    },
    draw: function () {
        spriteGround.draw(this.x, this.y);
        spriteGround.draw(this.x + spriteGround.width, this.y);
    }
},                

//Player
player = {
    x: 50,
    y: 0,
    height: spritePlayer.height,
    width: spritePlayer.width,
    gravity: gravity,
    jumpStrength: jumpStrength,
    lifes: startLifes,
    speed: 0,
    jumps: 0,
    score: 0,
    rotation: 0,
    colliding: false,
    _boosted: false,
    _invincible: false,
    _jumping: false,
    update: function () {
        this.speed += this.gravity;
        this.y += this.speed;
        this.rotation += Math.PI / 180 * speedBase;

        if (this.y > ground.y - this.height && GAME_STATE != game_states.loose) {
            this.y = ground.y - this.height;
            this.jumps = 0;
            this.speed = 0;
            this.jumpStrength = 30
            this._boosted = false
            this._invincible = false
        }
    },
    jump: function (sound = true) {
        if (this.jumps < maxJumps) {

            if(!this._jumping){
                this.speed = -this.jumpStrength;
                this.jumps++;

                //--------------------------------------------
                if(sound){
                    playSound('sounds/jump.mp3', 0.140)
                }
                //--------------------------------------------
            }
            this._jumping = true

            setTimeout(() => {
                this._jumping = false
            }, 150);

        }
    },
    reset: function () {
        this.speed = 0;
        this.y = 0;

        if (this.score > hightscores) {
            localStorage.setItem("hightscores", this.score);
            hightscores = this.score;
        }

        this.lifes = startLifes;
        this.score = 0;

        speedBase = 8;
        this.gravity = 1.567;
        currentPhase = 0;
    },
    draw: function () {
        
        ctx.save();

        var sprite;

        if(player._boosted){
            ctx.shadowColor = 'yellow'
            random = [0, 80]
            setInterval(() => {
                ctx.shadowBlur = random[Math.floor(Math.random() * random.length)]
            }, 800);
            sprite = spritePlayerBoosted;
        }else{
            sprite = spritePlayer;
        }

        if(this.colliding == true){
            if(!player._invincible){
                sprite = spritePlayerHit;
            }
        }
        
        //Operações para Rotacionar
        ctx.translate(this.x + sprite.width/2, this.y + sprite.height/2);
        ctx.rotate(this.rotation);
        
        sprite.draw(-sprite.width/2, -sprite.height/2);                        
        ctx.restore();


        // // Desenha a bolinha no canvas
        // ctx.beginPath();
        // //Ponto alto frente
        // ctx.arc((this.x + this.width), this.y, 5, 0, 2 * Math.PI);
        // //Ponto baixo frente
        // ctx.arc((this.x + this.width), this.y + this.height, 5, 0, 2 * Math.PI);
        // //Ponto alto traseiro
        // ctx.arc((this.x), this.y, 5, 0, 2 * Math.PI);
        // //Ponto baixo traseiro
        // ctx.arc((this.x), this.y + this.height, 5, 0, 2 * Math.PI);
        // ctx.fillStyle = "red"; // Cor de preenchimento da bolinha
        // ctx.fill();
        // ctx.closePath();
    },
    collided: function () {
        player.colliding = true;

        setTimeout(function(){
            player.colliding = false;
        }, 500);

        if(player._invincible){
            return
        }

        playSound('sounds/hit.mp3', 0.05)

        if(player.lifes >=1){
            player.lifes--;
        }else{
            GAME_STATE = game_states.loose;
            sounds.music.pause()
            playSound('sounds/loose.mp3', 0.2)
        }
    },
    scored: function (entity, qtdePT = 1) {
        entity._scored = true
        this.score+=qtdePT;
        let phasePoints = findCurrentPhase(this.score)

        let scr = new Audio('sounds/scored.mp3')
        scr.volume = 0.04
        scr.play()

        if(currentPhase != phasePoints){
            passOfPhase();
        }
    },
    upLife: function (life) {
        if(!life._scored){
            playSound('sounds/took_life.mp3', 0.2)
            player.lifes++
        }
    }
},

//Obstáculos
obstacles = {
    _obs: [],
    _scored: false,
    _sprites: [
        spriteObstacle1,
        spriteObstacle2,
        spriteObstacle3,
        spriteObstacle4,
        spriteObstacle5,
        spriteObstacle6,
        spriteObstacle7
    ],
    insertionTime: 0,
    insert: function () {

        if(currentPhase <= 4){
            obstacleHeight = 100;
        }else if (obstacleHeight > 4){
            obstacleHeight = 260;
        }

        this._obs.push({
            x: BASE_WIDTH, 
            y: ground.y - Math.floor(20 + Math.random() * obstacleHeight), 
            width: 50,
            sprite: this._sprites[Math.floor(this._sprites.length * Math.random())]
        });

        // this.insertionTime = (30 + Math.floor(60 * Math.random()) / speedBase*10);
        this.insertionTime = 30 + Math.floor(60 * Math.random());
    },
    update: function () {

        if (this.insertionTime == 0) {
            this.insert();
        } else {
            this.insertionTime--;
        }

        for (var i = 0, tam = this._obs.length; i < tam; i++) {
            var obs = this._obs[i];

            obs.x -= speedBase;
            if (
                !player.colliding
                && player.x < obs.x + obs.width
                && player.x + player.width >= obs.x
                && player.y + player.height >= obs.y
            ) {
                player.collided()
            } else if (obs.x <= 0 && !obs._scored) {
                player.scored(obs)
            } else if (obs.x <= -obs.width) {
                this._obs.splice(i, 1);
                tam--;
                i--;
            }
        }
    },
    reset: function () {
        this._obs = [];
    },
    draw: function () {
        for (var i = 0, tam = this._obs.length; i < tam; i++) {
            var obs = this._obs[i];
            obs.sprite.draw(obs.x, obs.y);
        }
    }
},

//Voadores
flying = {
    _fly: [],
    _sprites: [
        spriteFlying1,
        spriteFlying2,
        spriteFlying3,
        spriteFlying4,
        spriteFlying5,
    ],
    _brokenSprites: [
        spriteFlying1Damaged,
        spriteFlying2Damaged,
        spriteFlying3Damaged,
        spriteFlying4Damaged,
        spriteFlying5Damaged,
    ],
    _scored: false,
    _destroyed: false,
    insertionTime: 0,
    insert: function () {

        const index = Math.floor(this._sprites.length * Math.random())
        const sprite = this._sprites[index]

        this._fly.push({
            x: BASE_WIDTH, 
            y: ground.y - Math.floor(250 + Math.random() * 200),                           
            width: sprite.width,
            height: sprite.height,
            sprite,
            index,
            _destroyed: false,
            _scored: false
        });

        this.insertionTime = 30 + Math.floor(600 * Math.random());
    },
    update: function () {

        if (this.insertionTime == 0) {
            this.insert();

            //--------------------------------------------
            playSound('sounds/plane.mp3', 0.2)
            //--------------------------------------------

        } else {
            this.insertionTime--;
        }

        for (var i = 0, tam = this._fly.length; i < tam; i++) {
            var fly = this._fly[i];
            fly.x -= speedBase;

            if (fly._destroyed) {
                continue
            }

            // Verificar colisão com o voador
            if (
            !player.colliding
            && fly.x > -100
            && player.x + player.width >= fly.x 
            && player.x <= fly.x
            && player.y + (player.height/2) >= fly.y 
            && player.y <= fly.y + fly.height) {
                // Colisão na frente do fly
                //console.log(`Colidiu com voador ${i}`)
                if(!fly._destroyed){
                    if(currentPhase < 5){
                        player.collided()
                    }
    
                    this.destroy(fly)
                }
                
            }

            //Colisão superior indica pontuação
            if (!player.colliding 
            && player.x + player.width >= fly.x 
            && player.x <= fly.x + fly.width 
            && player.y <= fly.y 
            && player.y + player.height >= fly.y) {
                
                if(!fly._destroyed){
                    if(!fly._scored){
                        player.scored(fly, 5)
                    }
                    this.destroy(fly)
                }

            }

            if (fly._scored && fly.x <= -100) {
                this._fly.splice(i, 1);
                tam--;
                i--;
            }
        }
    },
    reset: function () {
        this._fly = [];
    },
    draw: function () {
        for (var i = 0, tam = this._fly.length; i < tam; i++) {
            var fly = this._fly[i];
            fly.sprite.draw(fly.x, fly.y);
        }
    },
    destroy: function (fly) {

        playSound('sounds/explosion.mp3', 0.1)

        let sprite =  this._brokenSprites[fly.index]
        fly._destroyed = true;

        player.jumps = 0
        player.jump(false)
        player.jumps = 0
        fly.sprite = sprite
        fly.speed++

        setInterval(() => {
            if(fly.y <= 500){
                fly.y++
            }
        }, 1)  
    }
},

//Item de Vida
life = {
    _lifes: [],
    sprite: spriteLife1,
    _scored: false,
    insertionTime: 9,
    insert: function () {
        this._lifes.push({
            x: BASE_WIDTH, 
            y: ground.y - Math.floor(250 + Math.random() * 200),                           
            width: spriteLife1.width,
            height: spriteLife1.height,
            sprite: this.sprite
        });

        this.insertionTime = 500 + Math.floor(800 * Math.random());
    },
    update: function () {

        if (this.insertionTime == 0) {
            this.insert();

            //--------------------------------------------
            playSound('sounds/life_spawn.mp3', 0.2)
            //--------------------------------------------

        } else {
            this.insertionTime--;
        }

        for (var i = 0, tam = this._lifes.length; i < tam; i++) {
            var life = this._lifes[i];
            life.x -= speedBase;

            if (
                (player.x + player.width) > life.x
                && (player.x + player.width) < (life.x + life.width)
                && (player.y + player.height) > life.y
                && (player.y + player.height) < (life.y + life.height)
            ) {
                // Ganha Vida
                player.upLife(life)
                life._scored = true

                life.sprite = spriteLife2

                setTimeout(() => {
                    life.sprite = spriteLife3
                }, 100);
                setTimeout(() => {
                    life.sprite = spriteLife4
                }, 200);
                setTimeout(() => {
                    life.sprite = spriteLife5
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
    reset: function () {
        this._lifes = [];
    },
    draw: function () {
        for (var i = 0, tam = this._lifes.length; i < tam; i++) {
            var life = this._lifes[i];
            life.sprite.draw(life.x, life.y);
        }
    },
}

//Item de Vida
slow = {
    _slows: [],
    sprite: spriteClock,
    _scored: false,
    insertionTime: 9,
    insert: function () {
        this._slows.push({
            x: BASE_WIDTH, 
            y: ground.y - Math.floor(250 + Math.random() * 200),                           
            width: spriteClock.width,
            height: spriteClock.height,
            sprite: this.sprite
        });

        this.insertionTime = 600 + Math.floor(1000 * Math.random());
    },
    update: function () {

        if (this.insertionTime == 0) {
            this.insert();

            //--------------------------------------------
            playSound('sounds/clock.mp3', 0.2)
            //--------------------------------------------

        } else {
            this.insertionTime--;
        }

        for (var i = 0, tam = this._slows.length; i < tam; i++) {
            var slow = this._slows[i];
            slow.x -= speedBase-5;

            if (
                (player.x + player.width) > slow.x
                && (player.x + player.width) < (slow.x + slow.width)
                && (player.y + player.height) > slow.y
                && (player.y + player.height) < (slow.y + slow.height)
            ) {
                if(slow._scored){
                    continue
                }

                musicSelected.pause()

                slow.x -= speedBase

                slow._scored = true
                setTimeout(() => {
                    slow._scored = false
                }, 500)

                playSound('sounds/slow.mp3', 0.2)

                flying.insertionTime = (30 + Math.floor(600 * Math.random())) + 20;
                obstacles.insertionTime = (40 + Math.floor(60 * Math.random())) + 20;
                player.gravity = 0.8
                speedBase = 4
                setTimeout(() => {
                    speedBase = 8 + currentPhase
                    flying.insertionTime = (30 + Math.floor(600 * Math.random()))
                    obstacles.insertionTime = 30 + Math.floor(60 * Math.random())
                    player.gravity = 1.5
                    musicSelected.play()
                }, 5000);

                slow.sprite = spriteClockBroken

                setTimeout(() => {
                    slow.sprite = spriteClockBroken2
                }, 100);
                setTimeout(() => {
                    slow.sprite = spriteClockBroken3
                }, 200);

                setTimeout(() => {
                    this._slows.splice(i, 1);
                    tam--;
                    i--;
                }, 400);

                setTimeout(() => {
                    this._slows.splice(i, 1);
                    tam--;
                    i--;
                }, 500);
            }

        }
    },
    reset: function () {
        this._slows = [];
    },
    draw: function () {
        for (var i = 0, tam = this._slows.length; i < tam; i++) {
            var slow = this._slows[i];
            slow.sprite.draw(slow.x, slow.y);
        }
    },
}

//Arquivos de Som
sounds = {
    lobby: new Audio('sounds/lobby.mp3'),
    start_game: new Audio('sounds/start_game.mp3'),
    music: new Audio('sounds/music.mp3'),
    music2: new Audio('sounds/music2.mp3'),
    music3: new Audio('sounds/music3.mp3'),
    music4: new Audio('sounds/music4.mp3'),
    music_boosted: new Audio('sounds/music_boosted.mp3'),
    boosted_effect: new Audio('sounds/boosted_effect.mp3'),
    boosted_catch: new Audio('sounds/boosted_catch.mp3'),
    phase_advanced: new Audio('sounds/phase_advanced.mp3'),
    jump: new Audio('sounds/jump.mp3'),
    explosion: new Audio('sounds/explosion.mp3'),
    loose: new Audio('sounds/loose.mp3'),
    hit: new Audio('sounds/hit.mp3'),
    plane: new Audio('sounds/plane.mp3'),
    life_spawn: new Audio('sounds/life_spawn.mp3'),
    took_life: new Audio('sounds/took_life.mp3'),
    slow: new Audio('sounds/slow.mp3'),
    scored: new Audio('sounds/scored.mp3'),
    clock: new Audio('sounds/clock.mp3'),
}

function main(){
    loadGame()
}

function loadGame(){
    
    //--------------------------------------------
    sounds.lobby.volume = 0.04
    sounds.lobby.play()
    //--------------------------------------------

    //localStorage.removeItem("hightscores");
    let scaleX = 1;
    let scaleY = 1;

    HEIGHT = window.innerHeight;
    WIDTH = window.innerWidth;

    if (WIDTH >= 800) {
        WIDTH = BASE_WIDTH;
        HEIGHT = BASE_HEIGHT;
    }

    canvas = document.createElement("canvas");
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    canvas.style.border = "1px solid";
    canvas.style.borderRadius = "5px";

    ctx = canvas.getContext("2d");

    document.body.appendChild(canvas);

    scaleX = canvas.width / BASE_WIDTH;
    scaleY = canvas.height / BASE_HEIGHT;

    ctx.scale(scaleX, scaleY);

    function resizeCanvas() {
        const aspectRatio = BASE_WIDTH / BASE_HEIGHT;

        // Calcula o tamanho máximo possível mantendo a proporção
        let width = window.innerWidth;
        let height = window.innerHeight;

        if (width / height > aspectRatio) {
            width = height * aspectRatio;
        } else {
            height = width / aspectRatio;
        }

        // Ajusta o estilo do canvas (tamanho visual)
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
    }

    // Redimensionar ao carregar e sempre que a janela mudar de tamanho
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    const userAgent = navigator.userAgent.toLowerCase();

    const isMobile = /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/.test(userAgent);

    if(isMobile){
        document.addEventListener("touchstart", click);
    }else{
        document.addEventListener("mousedown", click);
        document.addEventListener("keydown", click);
    }


    GAME_STATE = game_states.play;
    hightscores = localStorage.getItem("hightscores");

    if (hightscores == null) {
        hightscores = 0;
    }

    tile = new Image();
    tile.src = "imgs/sheet.png";

    loop();
}

function loop() {

    update();

    draw();

    window.requestAnimationFrame(loop);
}

function update() {
    ground.update();
    player.update();

    if (GAME_STATE == game_states.playing) {
        obstacles.update();
        flying.update();
        life.update();
        slow.update();
    } 
}

function draw() {

    bg.draw(0,0); 

    drawHudText(
        `Pontos: ${player.score}`, 
        25, 
        42,
    )
    drawHudText(
        `Vidas: ${player.lifes}`, 
        25, 
        76
    )
    drawHudText(
        newPhaseLabel.text, 
        0, 
        0, 
        newPhaseLabel.opacity, 
        true, 
        '255, 238, 0',
        '84, 84, 84',
        '700 80px'
    )

    if(GAME_STATE == game_states.playing){
        obstacles.draw();
        flying.draw();
        life.draw();
        slow.draw();
    }

    if(GAME_STATE == game_states.play){
        spritePlay.draw(BASE_WIDTH / 2 - spritePlay.width/2, BASE_HEIGHT / 2 - spritePlay.height/2)
    }

    if(GAME_STATE == game_states.loose){
        spriteLoose.draw(BASE_WIDTH / 2 - spriteLoose.width/2, BASE_HEIGHT / 2 - spriteLoose.height/2 - spriteHighscore.height/2);
    
        drawHudText(player.score, 410, 310)
        
        if(player.score > parseInt(hightscores)){
            spriteHighscore.draw(BASE_WIDTH / 2 - spriteHighscore.width/2, BASE_HEIGHT / 2 + spriteLoose.height/2 - spriteHighscore.height/2-83);
            drawHudText(player.score, 360, 400)
        }
    }

    ground.draw();               
    player.draw();
}

function passOfPhase(phase = null){

    //--------------------------------------------
    playSound('sounds/phase_advanced.mp3', 0.5)
    //--------------------------------------------

    speedBase++;
    // musicSelected.playbackRate+=0.1
    phase ? currentPhase = phase : currentPhase++;
    player.lifes++;

    if(currentPhase == 5){
        player._boosted = true
        // playSound('sounds/boost_player.mp3', 0.322)
        playSound('sounds/boosted_catch.mp3', 1)
        musicSelected.pause()

        setTimeout(() => {            
            continuousSoundEffect = new Audio('sounds/boosted_effect.mp3')
            continuousSoundEffect.volume = 0.15
            continuousSoundEffect.play()

            musicSelected = new Audio('sounds/music_boosted.mp3')
            musicSelected.volume = 0.4
            musicSelected.play()
            musicSelected.addEventListener('ended', () => {
                musicSelected.play()
            })
        }, 6000);
        player.jumpStrength = 60
        //player.gravity *= 0.6;
    }

    newPhaseLabel.text = "Level " + currentPhase;
    newPhaseLabel.fadeIn(0.4);

    setTimeout(function() {
        newPhaseLabel.fadeOut(0.4);
    }, BASE_WIDTH);
    
}

function click() {
    if (GAME_STATE == game_states.playing) {
        player.jump();
    } else if (GAME_STATE == game_states.play) {

        //--------------------------------------------
        sounds.lobby.pause()
        playSound('sounds/start_game.mp3', 0.2)
        
        let musics = [
            {name: 'music'},
            {name: 'music2'},
            {name: 'music3'},
            {name: 'music4'},
        ]

        const randomIndex = Math.floor(Math.random() * musics.length);

        musicSelected = sounds[musics[randomIndex].name]; 

        musicSelected.volume = 0.23
        musicSelected.play()
        musicSelected.addEventListener('ended', () => {
            musicSelected.play()
        })
        //--------------------------------------------

        GAME_STATE = game_states.playing;
    } else if (GAME_STATE == game_states.loose && player.y >= 2 * HEIGHT) {

        //--------------------------------------------
        musicSelected.pause()
        if(continuousSoundEffect){
            continuousSoundEffect.pause()
        }
        sounds.lobby.play()
        //--------------------------------------------

        GAME_STATE = game_states.play;
        obstacles.reset();
        player.reset();
    }
    
}

function playSound(path, volume = null){
    let sound = new Audio(path)

    if(volume > 0.0){
        sound.volume = volume
    }

    sound.play()
}

function drawHudText(
    text, 
    x, 
    y, 
    opacity = 1, 
    middle = false, 
    color = '241, 241, 241', 
    strokeColor = '84, 84, 84',
    fontSize = '600 30px'
){
    // Salvar o estado atual do context
    ctx.save();

    ctx.strokeStyle = `rgba(${strokeColor}, ${opacity})`;
    ctx.fillStyle = `rgba(${color}, ${opacity})`;
    ctx.font = `${fontSize} Arial`;
    ctx.lineWidth = 1;

    if(middle){
        ctx.fillText(text, BASE_WIDTH/2 - ctx.measureText(text).width/2, canvas.height/3);
        ctx.strokeText(text, BASE_WIDTH/2 - ctx.measureText(text).width/2, canvas.height/3);    
    }else{
        ctx.fillText(text, x, y);
        ctx.strokeText(text, x, y);
    }

    // Restaurar o estado do context
    ctx.restore();
}

function findCurrentPhase(pontos) {
    for (let i = 0; i < phasePointsEvolution.length; i++) {
      if (pontos < phasePointsEvolution[i]) {
        return i;
      }
    }
    // Se ultrapassar todos os limites, está na última fase
    return phasePointsEvolution.length;
}
  
window.onload = (event) => main()