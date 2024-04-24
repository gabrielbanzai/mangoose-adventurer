function Sprite(x, y, largura, altura) {
    this.x = x;
    this.y = y;
    this.largura = largura;
    this.altura = altura;

    this.desenha = function (xCanvas, yCanvas) {
        ctx.drawImage(
            img, //Imagem a ser carregada
            this.x, //Desenhar a partir de x
            this.y, //Desenhar a partir de y
            this.largura, //Desenhar até Largura total
            this.altura, //Desenhar até Altura total
            xCanvas, //X que queremos desenhar na Canvas
            yCanvas, //Y que queremos desenhar na Canvas
            this.largura, //Escala X
            this.altura //Escala Y
        );
    }
}

var bg = new Sprite(0, 0, 800, 600), 
spriteBoneco = new Sprite(980, 7, 104, 104),
spriteCheirado = new Sprite(1215, 23, 126, 126),
spriteBonecoDano = new Sprite(845, 8, 104, 104),
spritePoder1 = new Sprite(12, 1056, 130, 109),
spritePoder2 = new Sprite(169, 1049, 140, 124),
perdeu = new Sprite(944, 432, 266, 324),
jogar = new Sprite(897, 128, 292, 250),
novo = new Sprite(76, 761, 254, 115),
spriteRecorde = new Sprite(79, 892, 310, 92),
spriteChao = new Sprite(0, 607, 800, 85),
obstaculoAzul = new Sprite(578, 967, 50, 220);
obstaculoVerde = new Sprite(642, 967, 50, 220);
obstaculoVermelho = new Sprite(768, 967, 50, 220);
obstaculoAmarelo = new Sprite(705, 967, 50, 220);
obstaculoRoxo = new Sprite(832, 967, 50, 220);
obstaculoMarrom = new Sprite(895, 967, 50, 220);
obstaculoCinza = new Sprite(958, 967, 50, 220);
voador1 = new Sprite(12, 1127, 191, 60);
voador1Quebrado = new Sprite(12, 1000, 230, 95);
vidaSPR = new Sprite(587, 780, 72, 70);
vida2SPR = new Sprite(677, 779, 81, 76);
vida3SPR = new Sprite(774, 782, 94, 76);
vida4SPR = new Sprite(902, 781, 91, 77);
vida5SPR = new Sprite(1007, 779, 103, 85);
