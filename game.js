// Arquivo: game.js - VERSÃO RESPONSIVA E COM GRÁFICOS MELHORADOS

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// ATUALIZADO: O canvas agora pega o tamanho da janela
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// --- ESTADO DO JOGO ---
let gameState = 'start';

// --- VARIÁVEIS DO JOGO (Agora baseadas no tamanho da tela) ---
const gravity = canvas.height * 0.00055; // Gravidade proporcional à altura
const jumpStrength = -(canvas.height * 0.011); // Força do pulo proporcional
const pipeSpeed = canvas.width * 0.003; // Velocidade dos canos proporcional
const pipeGap = canvas.height * 0.22; // Espaço entre os canos
const pipeInterval = 120; // Distância entre os canos (ainda em frames)
let frameCount = 0;

// --- VARIÁVEIS DO PÁSSARO (Agora com tamanho proporcional) ---
let bird = {
    x: canvas.width / 5,
    y: canvas.height / 3,
    width: canvas.width * 0.09,
    height: canvas.width * 0.09, // Pássaro quadrado
    velocityY: 0
};
const birdImages = [];
const numBirdFrames = 1;
for (let i = 0; i < numBirdFrames; i++) {
    const img = new Image();
    img.src = `player_frame_${i}.png`;
    birdImages.push(img);
}

// --- VARIÁVEIS DOS CANOS E PONTUAÇÃO ---
let pipes = [];
let pipeWidth = canvas.width * 0.18; // Largura dos canos proporcional
let score = 0;
let highScore = localStorage.getItem('flappyBoloHighScore') || 0;

// --- VARIÁVEIS DAS NUVENS ---
let clouds = [];
const cloudSpeed = pipeSpeed / 2;

// --- Funções Principais ---

function handleInput() {
    if (gameState === 'start') gameState = 'playing';
    if (gameState === 'playing') bird.velocityY = jumpStrength;
    if (gameState === 'gameOver') resetGame();
}

function resetGame() {
    bird.y = canvas.height / 3;
    bird.velocityY = 0;
    pipes = [];
    score = 0;
    frameCount = 0;
    gameState = 'start';
    clouds = []; 
    generateInitialClouds();
}

function generateCloud() {
    const y = Math.random() * (canvas.height * 0.6);
    const width = 50 + Math.random() * 50;
    const height = 20 + Math.random() * 20;
    clouds.push({ x: canvas.width, y: y, width: width, height: height });
}

function generateInitialClouds() {
    for(let i = 0; i < 5; i++) {
        const y = Math.random() * (canvas.height * 0.6);
        const x = Math.random() * canvas.width;
        const width = 50 + Math.random() * 50;
        const height = 20 + Math.random() * 20;
        clouds.push({ x: x, y: y, width: width, height: height });
    }
}

function updateGame() {
    bird.velocityY += gravity;
    bird.y += bird.velocityY;
    if (bird.y + bird.height > canvas.height || bird.y < 0) gameState = 'gameOver';

    frameCount++;
    if (frameCount % pipeInterval === 0) {
        let pipeY = (Math.random() * (canvas.height - pipeGap - (canvas.height * 0.2))) + (canvas.height * 0.1);
        pipes.push({ x: canvas.width, y: pipeY, passed: false });
    }
    if (frameCount % 200 === 0) generateCloud();

    for (let i = pipes.length - 1; i >= 0; i--) {
        let p = pipes[i];
        p.x -= pipeSpeed;
        if (bird.x < p.x + pipeWidth && bird.x + bird.width > p.x &&
            (bird.y < p.y || bird.y + bird.height > p.y + pipeGap)) gameState = 'gameOver';
        if (p.x + pipeWidth < bird.x && !p.passed) { score++; p.passed = true; }
        if (p.x + pipeWidth < 0) pipes.splice(i, 1);
    }

    for (let i = clouds.length - 1; i >= 0; i--) {
        clouds[i].x -= cloudSpeed;
        if (clouds[i].x + clouds[i].width < 0) clouds.splice(i, 1);
    }

    if (gameState === 'gameOver') {
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('flappyBoloHighScore', highScore);
        }
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'white';
    for (const cloud of clouds) {
        ctx.fillRect(cloud.x, cloud.y, cloud.width, cloud.height);
    }

    for (let p of pipes) {
        const topPipeHeight = p.y;
        const bottomPipeY = p.y + pipeGap;
        const bottomPipeHeight = canvas.height - bottomPipeY;
        ctx.fillStyle = '#73BF29';
        ctx.fillRect(p.x, 0, pipeWidth, topPipeHeight);
        ctx.fillRect(p.x, bottomPipeY, pipeWidth, bottomPipeHeight);
        ctx.fillStyle = '#55801F';
        ctx.fillRect(p.x + pipeWidth - 10, 0, 10, topPipeHeight);
        ctx.fillRect(p.x + pipeWidth - 10, bottomPipeY, 10, bottomPipeHeight);
        const capHeight = canvas.height * 0.04;
        ctx.fillStyle = '#73BF29';
        ctx.fillRect(p.x - 5, topPipeHeight - capHeight, pipeWidth + 10, capHeight);
        ctx.fillRect(p.x - 5, bottomPipeY, pipeWidth + 10, capHeight);
    }

    if (birdImages[0] && birdImages[0].complete && birdImages[0].naturalHeight !== 0) {
        ctx.drawImage(birdImages[0], bird.x, bird.y, bird.width, bird.height);
    } else {
        ctx.fillStyle = 'yellow';
        ctx.fillRect(bird.x, bird.y, bird.width, bird.height);
    }
    
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    const largeFontSize = canvas.height * 0.06;
    const mediumFontSize = canvas.height * 0.04;
    const smallFontSize = canvas.height * 0.035;

    if (gameState === 'start') {
        ctx.font = `${mediumFontSize}px Arial`;
        ctx.strokeText('Clique para Começar', canvas.width / 2, canvas.height / 2);
        ctx.fillText('Clique para Começar', canvas.width / 2, canvas.height / 2);
        if (highScore > 0) {
            ctx.font = `${smallFontSize}px Arial`;
            ctx.strokeText(`Melhor Pontuação: ${highScore}`, canvas.width / 2, canvas.height / 2 + 40);
            ctx.fillText(`Melhor Pontuação: ${highScore}`, canvas.width / 2, canvas.height / 2 + 40);
        }
    }
    
    if (gameState === 'playing' || gameState === 'gameOver') {
        ctx.font = `${largeFontSize}px Arial`;
        ctx.strokeText(score, canvas.width / 2, canvas.height * 0.1);
        ctx.fillText(score, canvas.width / 2, canvas.height * 0.1);
    }

    if (gameState === 'gameOver') {
        ctx.font = `${mediumFontSize}px Arial`;
        ctx.strokeText('Game Over', canvas.width / 2, canvas.height / 2 - 40);
        ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2 - 40);
        ctx.font = `${smallFontSize}px Arial`;
        ctx.strokeText(`Pontuação: ${score}`, canvas.width / 2, canvas.height / 2);
        ctx.fillText(`Pontuação: ${score}`, canvas.width / 2, canvas.height / 2);
        ctx.strokeText(`Melhor: ${highScore}`, canvas.width / 2, canvas.height / 2 + 30);
        ctx.fillText(`Melhor: ${highScore}`, canvas.width / 2, canvas.height / 2 + 30);
        ctx.strokeText('Clique para Tentar Novamente', canvas.width / 2, canvas.height / 2 + 70);
        ctx.fillText('Clique para Tentar Novamente', canvas.width / 2, canvas.height / 2 + 70);
    }
}

function gameLoop() {
    if (gameState === 'playing') updateGame();
    draw();
    requestAnimationFrame(gameLoop);
}

document.addEventListener('click', handleInput);
document.addEventListener('touchstart', (e) => { e.preventDefault(); handleInput(); });
document.addEventListener('keydown', (e) => { if (e.code === 'Space') { handleInput(); } });

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    resetGame();
});

resetGame();
gameLoop();