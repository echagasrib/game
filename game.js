// Arquivo: game.js - VERSÃO COMPLETA DO JOGO

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// --- ESTADO DO JOGO ---
let gameState = 'start'; // 'start', 'playing', 'gameOver'

// --- VARIÁVEIS DO JOGO ---
const gravity = 0.3;
const jumpStrength = -6;
const pipeSpeed = 2;
const pipeGap = 120; // Espaço vertical entre os canos
const pipeInterval = 120; // Distância horizontal entre os canos
let frameCount = 0;

// --- VARIÁVEIS DO PÁSSARO ---
let bird = {
    x: 50,
    y: 150,
    width: 20,
    height: 20,
    velocityY: 0
};

// --- VARIÁVEIS DOS CANOS ---
let pipes = [];
let pipeWidth = 50;

// --- PONTUAÇÃO ---
let score = 0;

function handleInput() {
    if (gameState === 'start') {
        gameState = 'playing';
    }
    if (gameState === 'playing') {
        bird.velocityY = jumpStrength;
    }
    if (gameState === 'gameOver') {
        // Reseta o jogo ao clicar depois de perder
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
}

function gameLoop() {
    // 1. Limpa a tela
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // --- LÓGICA DO JOGO ---
    if (gameState === 'playing') {
        // Pássaro
        bird.velocityY += gravity;
        bird.y += bird.velocityY;

        // Canos
        frameCount++;
        if (frameCount % pipeInterval === 0) {
            // Gera um novo cano
            let pipeY = Math.random() * (canvas.height - pipeGap - 100) + 50;
            pipes.push({ x: canvas.width, y: pipeY });
        }
        
        // Move os canos e checa pontuação/colisão
        for (let i = pipes.length - 1; i >= 0; i--) {
            let p = pipes[i];
            p.x -= pipeSpeed;
            
            // Checa colisão
            if (bird.x < p.x + pipeWidth &&
                bird.x + bird.width > p.x &&
                (bird.y < p.y || bird.y + bird.height > p.y + pipeGap)) {
                gameState = 'gameOver';
            }
            
            // Checa pontuação
            if (p.x + pipeWidth < bird.x && !p.passed) {
                score++;
                p.passed = true;
            }

            // Remove canos que saíram da tela
            if (p.x + pipeWidth < 0) {
                pipes.splice(i, 1);
            }
        }
        
        // Colisão com chão ou teto
        if (bird.y + bird.height > canvas.height || bird.y < 0) {
            gameState = 'gameOver';
        }
    }
    
    // --- DESENHO NA TELA ---
    // Desenha os canos
    ctx.fillStyle = 'green';
    for (let p of pipes) {
        ctx.fillRect(p.x, 0, pipeWidth, p.y); // Cano de cima
        ctx.fillRect(p.x, p.y + pipeGap, pipeWidth, canvas.height - (p.y + pipeGap)); // Cano de baixo
    }

    // Desenha o pássaro
    ctx.fillStyle = 'yellow';
    ctx.fillRect(bird.x, bird.y, bird.width, bird.height);
    
    // Desenha textos e pontuação
    ctx.fillStyle = 'white';
    ctx.font = '24px Arial';
    ctx.textAlign = 'center';

    if (gameState === 'start') {
        ctx.fillText('Clique para Começar', canvas.width / 2, canvas.height / 2);
    }
    
    if (gameState === 'playing' || gameState === 'gameOver') {
        ctx.font = '40px Arial';
        ctx.fillText(score, canvas.width / 2, 50);
    }

    if (gameState === 'gameOver') {
        ctx.font = '32px Arial';
        ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2 - 20);
        ctx.font = '20px Arial';
        ctx.fillText('Clique para Tentar Novamente', canvas.width / 2, canvas.height / 2 + 20);
    }
    
    requestAnimationFrame(gameLoop);
}

// Eventos de input
document.addEventListener('click', handleInput);
document.addEventListener('touchstart', (e) => { e.preventDefault(); handleInput(); });
document.addEventListener('keydown', (e) => { if (e.code === 'Space') { handleInput(); } });

// Inicia o jogo
gameLoop();