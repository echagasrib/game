// Arquivo: game.js - VERSÃO COM TESTES
console.log("Arquivo game.js carregado com sucesso.");

const canvas = document.getElementById('gameCanvas');
console.log("Procurando o elemento canvas:", canvas); // Isso deve mostrar o elemento <canvas>

const ctx = canvas.getContext('2d');
console.log("Obtendo o contexto 2D:", ctx); // Isso deve mostrar o objeto de desenho

// Variáveis do Pássaro
let birdX = 50;
let birdY = 150;
let birdWidth = 20;
let birdHeight = 20;

// Físicas do Jogo
let velocityY = 0;
const gravity = 0.25;
const jumpStrength = -5;

function flap() {
    velocityY = jumpStrength;
}

document.addEventListener('mousedown', flap);
document.addEventListener('touchstart', (e) => { e.preventDefault(); flap(); }); 
document.addEventListener('keydown', (e) => { if (e.code === 'Space') { flap(); } });

function gameLoop() {
    // Atualiza a lógica
    velocityY += gravity;
    birdY += velocityY;

    // Colisão com o chão e teto
    if (birdY + birdHeight > canvas.height) { birdY = canvas.height - birdHeight; velocityY = 0; }
    if (birdY < 0) { birdY = 0; velocityY = 0; }

    // Limpa a tela
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Desenha
    ctx.fillStyle = 'yellow';
    ctx.fillRect(birdX, birdY, birdWidth, birdHeight);
    
    // Escreve no console a cada quadro de animação
    console.log("Desenhando pássaro em Y:", birdY);
    
    requestAnimationFrame(gameLoop);
}

console.log("Iniciando o loop principal do jogo...");
gameLoop();