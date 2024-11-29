function Sprite(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;

    this.draw = function (xCanvas, yCanvas) {
        ctx.drawImage(
            tile, //Imagem a ser carregada
            this.x, //Desenhar a partir de x
            this.y, //Desenhar a partir de y
            this.width, //Desenhar até Largura total
            this.height, //Desenhar até Altura total
            xCanvas, //X que queremos desenhar na Canvas
            yCanvas, //Y que queremos desenhar na Canvas
            this.width, //Escala X
            this.height //Escala Y
        );
    }
}

var bg = new Sprite(0, 0, 800, 600), 
spriteGround = new Sprite(0, 599, 800, 99),
spriteNewGame = new Sprite(76, 761, 254, 115),
spritePlay = new Sprite(6, 708, 388, 332),
spriteLoose = new Sprite(510, 762, 195, 236),
spriteHighscore = new Sprite(808, 823, 195, 171),
spritePlayer = new Sprite(800, 0, 104, 104),
spritePlayerHit = new Sprite(904, 0, 104, 104),
spritePlayerBoosted = new Sprite(1008, 0, 104, 104),
spritePlayerBoostedCover = new Sprite(1124, 0, 200, 200),
spriteObstacle1 = new Sprite(800, 200, 50, 400);
spriteObstacle2 = new Sprite(850, 200, 50, 400);
spriteObstacle3 = new Sprite(900, 200, 50, 400);
spriteObstacle4 = new Sprite(950, 200, 50, 400);
spriteObstacle5 = new Sprite(1000, 200, 50, 400);
spriteObstacle6 = new Sprite(1050, 200, 50, 400);
spriteObstacle7 = new Sprite(1100, 200, 50, 400);
spriteFlying1 = new Sprite(20, 1130, 191, 60);
spriteFlying1Damaged = new Sprite(300, 1080, 250, 130);
spriteFlying2 = new Sprite(20, 1340, 191, 60);
spriteFlying2Damaged = new Sprite(300, 1275, 250, 130);
spriteFlying3 = new Sprite(20, 1530, 191, 60);
spriteFlying3Damaged = new Sprite(300, 1470, 250, 130);
spriteFlying4 = new Sprite(20, 1730, 191, 60);
spriteFlying4Damaged = new Sprite(300, 1690, 250, 130);
spriteFlying5 = new Sprite(20, 1920, 191, 60);
spriteFlying5Damaged = new Sprite(300, 1890, 250, 130);
spriteLife1 = new Sprite(1120, 670, 70, 70);
spriteLife2 = new Sprite(1120, 770, 78, 76);
spriteLife3 = new Sprite(1120, 880, 91, 76);
spriteLife4 = new Sprite(1120, 1000, 88, 76);
spriteLife5 = new Sprite(1120, 1120, 98, 85);
spriteClock = new Sprite(800, 1040, 68, 68);
spriteClock2 = new Sprite(800, 1130, 68, 68);
spriteClock3 = new Sprite(800, 1220, 68, 68);
spriteClockBroken = new Sprite(900, 1000, 136, 123);
spriteClockBroken2 = new Sprite(900, 1120, 140, 142);
spriteClockBroken3 = new Sprite(900, 1270, 98, 85);