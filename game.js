// Arquivo: game.js - VERSÃO COM GRÁFICOS MELHORADOS

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// --- ESTADO DO JOGO ---
let gameState = 'start';

// --- VARIÁVEIS DO JOGO ---
const gravity = 0.3;
const jumpStrength = -6;
const pipeSpeed = 2;
const pipeGap = 120;
const pipeInterval = 120;
let frameCount = 0;

// --- VARIÁVEIS DO PÁSSARO ---
let bird = { x: 50, y: 150, width: 32, height: 32, velocityY: 0 };
const birdImages = [];
const numBirdFrames = 1;
for (let i = 0; i < numBirdFrames; i++) {
    const img = new Image();
    img.src = `player_frame_${i}.png`;
    birdImages.push(img);
}

// --- VARIÁVEIS DOS CANOS E PONTUAÇÃO ---
let pipes = [];
let pipeWidth = 50;
let score = 0;
let highScore = localStorage.getItem('flappyBoloHighScore') || 0;

// NOVO: VARIÁVEIS DAS NUVENS PARA O FUNDO
let clouds = [];
const cloudSpeed = pipeSpeed / 2; // Nuvens se movem mais devagar

// --- Funções Principais ---

function handleInput() {
    if (gameState === 'start') gameState = 'playing';
    if (gameState === 'playing') bird.velocityY = jumpStrength;
    if (gameState === 'gameOver') resetGame();
}

function resetGame() {
    bird.y = 150;
    bird.velocityY = 0;
    pipes = [];
    score = 0;
    frameCount = 0;
    gameState = 'start';
    // NOVO: Reinicia as nuvens
    clouds = []; 
    generateInitialClouds();
}

// NOVO: Função para gerar nuvens
function generateCloud() {
    const y = Math.random() * (canvas.height - 200);
    const width = 50 + Math.random() * 50;
    const height = 20 + Math.random() * 20;
    clouds.push({ x: canvas.width, y: y, width: width, height: height });
}

function generateInitialClouds() {
    for(let i = 0; i < 5; i++) {
        const y = Math.random() * (canvas.height - 200);
        const x = Math.random() * canvas.width;
        const width = 50 + Math.random() * 50;
        const height = 20 + Math.random() * 20;
        clouds.push({ x: x, y: y, width: width, height: height });
    }
}


function updateGame() {
    // Pássaro
    bird.velocityY += gravity;
    bird.y += bird.velocityY;
    if (bird.y + bird.height > canvas.height || bird.y < 0) gameState = 'gameOver';

    // Canos
    frameCount++;
    if (frameCount % pipeInterval === 0) {
        let pipeY = Math.random() * (canvas.height - pipeGap - 100) + 50;
        pipes.push({ x: canvas.width, y: pipeY, passed: false });
    }
    // NOVO: Gera nuvens periodicamente
    if (frameCount % 200 === 0) {
        generateCloud();
    }

    for (let i = pipes.length - 1; i >= 0; i--) {
        let p = pipes[i];
        p.x -= pipeSpeed;
        if (bird.x < p.x + pipeWidth && bird.x + bird.width > p.x &&
            (bird.y < p.y || bird.y + bird.height > p.y + pipeGap)) gameState = 'gameOver';
        if (p.x + pipeWidth < bird.x && !p.passed) { score++; p.passed = true; }
        if (p.x + pipeWidth < 0) pipes.splice(i, 1);
    }

    // NOVO: Move as nuvens
    for (let i = clouds.length - 1; i >= 0; i--) {
        clouds[i].x -= cloudSpeed;
        if (clouds[i].x + clouds[i].width < 0) clouds.splice(i, 1);
    }


    // High Score
    if (gameState === 'gameOver') {
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('flappyBoloHighScore', highScore);
        }
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // NOVO: Desenha as nuvens primeiro, para ficarem no fundo
    ctx.fillStyle = 'white';
    for (const cloud of clouds) {
        ctx.fillRect(cloud.x, cloud.y, cloud.width, cloud.height);
    }


    // ATUALIZADO: Lógica de desenho dos canos para parecerem 3D
    for (let p of pipes) {
        const topPipeY = 0;
        const topPipeHeight = p.y;
        const bottomPipeY = p.y + pipeGap;
        const bottomPipeHeight = canvas.height - bottomPipeY;

        // Corpo do cano
        ctx.fillStyle = '#73BF29'; // Verde principal
        ctx.fillRect(p.x, topPipeY, pipeWidth, topPipeHeight);
        ctx.fillRect(p.x, bottomPipeY, pipeWidth, bottomPipeHeight);

        // Sombra para dar profundidade
        ctx.fillStyle = '#55801F'; // Verde escuro
        ctx.fillRect(p.x + pipeWidth - 10, topPipeY, 10, topPipeHeight);
        ctx.fillRect(p.x + pipeWidth - 10, bottomPipeY, 10, bottomPipeHeight);

        // Boca do cano
        const capHeight = 20;
        ctx.fillStyle = '#73BF29';
        ctx.fillRect(p.x - 5, topPipeHeight - capHeight, pipeWidth + 10, capHeight);
        ctx.fillRect(p.x - 5, bottomPipeY, pipeWidth + 10, capHeight);
    }

    // Desenha a imagem do pássaro
    if (birdImages[0] && birdImages[0].complete && birdImages[0].naturalHeight !== 0) {
        ctx.drawImage(birdImages[0], bird.x, bird.y, bird.width, bird.height);
    } else {
        ctx.fillStyle = 'yellow';
        ctx.fillRect(bird.x, bird.y, bird.width, bird.height);
    }
    
    // Desenha textos e pontuação
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.strokeStyle = 'black'; // Contorno para o texto
    ctx.lineWidth = 2;

    if (gameState === 'start') {
        ctx.font = '24px Arial';
        ctx.strokeText('Clique para Começar', canvas.width / 2, canvas.height / 2);
        ctx.fillText('Clique para Começar', canvas.width / 2, canvas.height / 2);
        if (highScore > 0) {
            ctx.font = '20px Arial';
            ctx.strokeText(`Melhor Pontuação: ${highScore}`, canvas.width / 2, canvas.height / 2 + 40);
            ctx.fillText(`Melhor Pontuação: ${highScore}`, canvas.width / 2, canvas.height / 2 + 40);
        }
    }
    
    if (gameState === 'playing' || gameState === 'gameOver') {
        ctx.font = '40px Arial';
        ctx.strokeText(score, canvas.width / 2, 50);
        ctx.fillText(score, canvas.width / 2, 50);
    }

    if (gameState === 'gameOver') {
        ctx.font = '32px Arial';
        ctx.strokeText('Game Over', canvas.width / 2, canvas.height / 2 - 40);
        ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2 - 40);
        ctx.font = '20px Arial';
        ctx.strokeText(`Pontuação: ${score}`, canvas.width / 2, canvas.height / 2);
        ctx.fillText(`Pontuação: ${score}`, canvas.width / 2, canvas.height / 2);
        ctx.strokeText(`Melhor: ${highScore}`, canvas.width / 2, canvas.height / 2 + 30);
        ctx.fillText(`Melhor: ${highScore}`, canvas.width / 2, canvas.height / 2 + 30);
        ctx.strokeText('Clique para Tentar Novamente', canvas.width / 2, canvas.height / 2 + 70);
        ctx.fillText('Clique para Tentar Novamente', canvas.width / 2, canvas.height / 2 + 70);
    }
}

function gameLoop() {
    if (gameState === 'playing' || gameState === 'start') {
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
resetGame();
gameLoop();