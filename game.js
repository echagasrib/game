// Arquivo: game.js - VERSÃO COM RANKING (HIGH SCORE)

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// --- ESTADO DO JOGO ---
let gameState = 'start'; // 'start', 'playing', 'gameOver'

// --- VARIÁVEIS DO JOGO ---
const gravity = 0.3;
const jumpStrength = -6;
const pipeSpeed = 2;
const pipeGap = 120;
const pipeInterval = 120;
let frameCount = 0;

// --- VARIÁVEIS DO PÁSSARO ---
let bird = { x: 50, y: 150, width: 20, height: 20, velocityY: 0 };

// --- VARIÁVEIS DOS CANOS ---
let pipes = [];
let pipeWidth = 50;

// --- PONTUAÇÃO E RANKING ---
let score = 0;
// NOVO: Carrega o High Score salvo no navegador. Se não existir, começa com 0.
let highScore = localStorage.getItem('flappyBoloHighScore') || 0;

function handleInput() {
    if (gameState === 'start') {
        gameState = 'playing';
    }
    if (gameState === 'playing') {
        bird.velocityY = jumpStrength;
    }
    if (gameState === 'gameOver') {
        resetGame();
        gameState = 'start';
    }
}

function resetGame() {
    bird.y = 150;
    bird.velocityY = 0;
    pipes = [];
    score = 0;
    frameCount = 0;
    gameState = 'start';
}

function updateGame() {
    // Pássaro
    bird.velocityY += gravity;
    bird.y += bird.velocityY;

    // Colisão com chão ou teto
    if (bird.y + bird.height > canvas.height || bird.y < 0) {
        gameState = 'gameOver';
    }

    // Geração de Canos
    frameCount++;
    if (frameCount % pipeInterval === 0) {
        let pipeY = Math.random() * (canvas.height - pipeGap - 100) + 50;
        pipes.push({ x: canvas.width, y: pipeY, passed: false });
    }

    // Move os canos, checa colisão e pontuação
    for (let i = pipes.length - 1; i >= 0; i--) {
        let p = pipes[i];
        p.x -= pipeSpeed;

        // Checa colisão com o cano
        if (bird.x < p.x + pipeWidth && bird.x + bird.width > p.x &&
            (bird.y < p.y || bird.y + bird.height > p.y + pipeGap)) {
            gameState = 'gameOver';
        }
        
        // Checa se passou pelo cano para pontuar
        if (p.x + pipeWidth < bird.x && !p.passed) {
            score++;
            p.passed = true;
        }

        // Remove canos que saíram da tela
        if (p.x + pipeWidth < 0) {
            pipes.splice(i, 1);
        }
    }

    // NOVO: Lógica de High Score
    if (gameState === 'gameOver') {
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('flappyBoloHighScore', highScore); // Salva no navegador
        }
    }
}

function draw() {
    // Limpa a tela
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Desenha os canos
    ctx.fillStyle = 'green';
    for (let p of pipes) {
        ctx.fillRect(p.x, 0, pipeWidth, p.y); // Cano de cima
        ctx.fillRect(p.x, p.y + pipeGap, pipeWidth, canvas.height - (p.y + pipeGap));
    }

    // Desenha o pássaro
    ctx.fillStyle = 'yellow';
    ctx.fillRect(bird.x, bird.y, bird.width, bird.height);
    
    // Desenha textos e pontuação
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';

    if (gameState === 'start') {
        ctx.font = '24px Arial';
        ctx.fillText('Clique para Começar', canvas.width / 2, canvas.height / 2);
        // NOVO: Mostra o High Score na tela inicial
        if (highScore > 0) {
            ctx.font = '20px Arial';
            ctx.fillText(`Melhor Pontuação: ${highScore}`, canvas.width / 2, canvas.height / 2 + 40);
        }
    }
    
    if (gameState === 'playing' || gameState === 'gameOver') {
        ctx.font = '40px Arial';
        ctx.fillText(score, canvas.width / 2, 50);
    }

    if (gameState === 'gameOver') {
        ctx.font = '32px Arial';
        ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2 - 40);
        // NOVO: Mostra a pontuação final e o High Score
        ctx.font = '20px Arial';
        ctx.fillText(`Pontuação: ${score}`, canvas.width / 2, canvas.height / 2);
        ctx.fillText(`Melhor: ${highScore}`, canvas.width / 2, canvas.height / 2 + 30);
        ctx.fillText('Clique para Tentar Novamente', canvas.width / 2, canvas.height / 2 + 70);
    }
}

function gameLoop() {
    if (gameState === 'playing') {
        updateGame();
    }
    draw();
    requestAnimationFrame(gameLoop);
}

// Eventos de input
document.addEventListener('click', handleInput);
document.addEventListener('touchstart', (e) => { e.preventDefault(); handleInput(); });
document.addEventListener('keydown', (e) => { if (e.code === 'Space') { handleInput(); } });

// Inicia o jogo
resetGame(); // Garante que o estado inicial está correto
gameLoop();