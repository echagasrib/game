// Arquivo: game.js - VERSÃO FINAL (POLIMENTO GRÁFICO E DE MOVIMENTO)

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// --- ESTADO DO JOGO ---
let gameState = 'start';

// --- VARIÁVEIS DO JOGO (FÍSICA AJUSTADA) ---
// ATUALIZADO: Pequenos ajustes na física para um movimento mais "saltitante".
const gravity = canvas.height * 0.00065; 
const jumpStrength = -(canvas.height * 0.012);
const pipeSpeed = canvas.width * 0.003;
const MIN_PIPE_GAP = canvas.height * 0.21;
const MAX_PIPE_GAP = canvas.height * 0.28;
const pipeInterval = 180; 
let frameCount = 0;

// --- VARIÁVEIS DO PÁSSARO ---
let bird = {
    x: canvas.width / 5,
    y: canvas.height / 3,
    width: canvas.width * 0.09,
    height: canvas.width * 0.09,
    velocityY: 0,
    rotation: 0 // NOVO: Ângulo de rotação do pássaro
};
const birdImages = [];
const numBirdFrames = 1;
for (let i = 0; i < numBirdFrames; i++) {
    const img = new Image();
    img.src = `player_frame_${i}.png`;
    birdImages.push(img);
}

// --- VARIÁVEIS DOS CANOS, PONTUAÇÃO E NUVENS ---
let pipes = [];
let pipeWidth = canvas.width * 0.18;
let score = 0;
let highScore = localStorage.getItem('flappyBoloHighScore') || 0;
let clouds = [];
const cloudSpeed = pipeSpeed / 2;

// --- Funções Principais ---

function handleInput() {
    if (gameState === 'start') gameState = 'playing';
    if (gameState === 'playing') bird.velocityY = jumpStrength;
    if (gameState === 'gameOver') resetGame();
}

function resetGame() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    bird.y = canvas.height / 3;
    bird.velocityY = 0;
    bird.rotation = 0; // NOVO: Reseta a rotação
    pipes = [];
    score = 0;
    frameCount = 0;
    gameState = 'start';
    clouds = []; 
    generateInitialClouds();
    
    generatePipe(); 
}

function generatePipe() {
    const newPipeGap = Math.random() * (MAX_PIPE_GAP - MIN_PIPE_GAP) + MIN_PIPE_GAP;
    const minHeight = canvas.height * 0.1;
    const maxHeight = canvas.height - newPipeGap - minHeight;
    let pipeY = Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;
    pipes.push({ x: canvas.width, y: pipeY, gap: newPipeGap, passed: false });
}

function generateCloud() { // ... (código das nuvens não muda) ...
    const y = Math.random() * (canvas.height * 0.6);
    const numCircles = 3 + Math.floor(Math.random() * 3);
    const baseRadius = 15 + Math.random() * 10;
    const circles = [];
    for (let i = 0; i < numCircles; i++) { circles.push({ offsetX: (i * baseRadius * 1.2) - (numCircles * baseRadius * 0.6), offsetY: (Math.random() - 0.5) * baseRadius * 0.5, radius: baseRadius * (0.8 + Math.random() * 0.4) }); }
    clouds.push({ x: canvas.width + 50, y: y, circles: circles });
}

function generateInitialClouds() { // ... (código das nuvens não muda) ...
    for(let i = 0; i < 5; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * (canvas.height * 0.6);
        const numCircles = 3 + Math.floor(Math.random() * 3);
        const baseRadius = 15 + Math.random() * 10;
        const circles = [];
        for (let j = 0; j < numCircles; j++) { circles.push({ offsetX: (j * baseRadius * 1.2) - (numCircles * baseRadius * 0.6), offsetY: (Math.random() - 0.5) * baseRadius * 0.5, radius: baseRadius * (0.8 + Math.random() * 0.4) }); }
        clouds.push({ x: x, y: y, circles: circles });
    }
}

function updateGame() {
    // Pássaro
    bird.velocityY += gravity;
    bird.y += bird.velocityY;
    
    // NOVO: Atualiza a rotação do pássaro com base na velocidade
    if (bird.velocityY < 0) {
        // Subindo
        bird.rotation = -0.3; // Ângulo para cima em radianos (aprox. -15 graus)
    } else {
        // Caindo
        bird.rotation += 0.05;
        if (bird.rotation > 1.2) { // Limita a rotação para baixo
            bird.rotation = 1.2; // Aprox. 70 graus
        }
    }
    
    if (bird.y + bird.height > canvas.height || bird.y < 0) gameState = 'gameOver';

    // Canos e Nuvens
    frameCount++;
    if (frameCount % pipeInterval === 0) generatePipe();
    if (frameCount % 200 === 0) generateCloud();

    for (let i = pipes.length - 1; i >= 0; i--) { /* ... (lógica dos canos não muda) ... */
        let p = pipes[i];
        p.x -= pipeSpeed;
        if (bird.x < p.x + pipeWidth && bird.x + bird.width > p.x && (bird.y < p.y || bird.y + bird.height > p.y + p.gap)) gameState = 'gameOver';
        if (p.x + pipeWidth < bird.x && !p.passed) { score++; p.passed = true; }
        if (p.x + pipeWidth < 0) pipes.splice(i, 1);
    }
    for (let i = clouds.length - 1; i >= 0; i--) { /* ... (lógica das nuvens não muda) ... */
        clouds[i].x -= cloudSpeed;
        if (clouds[i].x < -100) clouds.splice(i, 1);
    }
    if (gameState === 'gameOver' && score > highScore) { /* ... (lógica de high score não muda) ... */
        highScore = score;
        localStorage.setItem('flappyBoloHighScore', highScore);
    }
}

function draw() {
    // ATUALIZADO: Fundo com gradiente
    const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    skyGradient.addColorStop(0, '#5D95E8'); // Azul mais escuro no topo
    skyGradient.addColorStop(1, '#87CEEB'); // Azul mais claro na base
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Nuvens
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    for (const cloud of clouds) {
        for (const circle of cloud.circles) { ctx.beginPath(); ctx.arc(cloud.x + circle.offsetX, cloud.y + circle.offsetY, circle.radius, 0, Math.PI * 2); ctx.fill(); }
    }

    // Canos
    for (let p of pipes) {
        // ATUALIZADO: Gradiente para os canos para efeito 3D
        const pipeGradient = ctx.createLinearGradient(p.x, 0, p.x + pipeWidth, 0);
        pipeGradient.addColorStop(0, '#55801F'); // Lado escuro
        pipeGradient.addColorStop(0.5, '#73BF29'); // Meio claro
        pipeGradient.addColorStop(1, '#55801F'); // Outro lado escuro
        
        const topPipeHeight = p.y;
        const bottomPipeY = p.y + p.gap;
        ctx.fillStyle = pipeGradient;
        ctx.fillRect(p.x, 0, pipeWidth, topPipeHeight);
        ctx.fillRect(p.x, bottomPipeY, pipeWidth, canvas.height - bottomPipeY);
        
        const capHeight = canvas.height * 0.04;
        ctx.fillRect(p.x - 5, topPipeHeight - capHeight, pipeWidth + 10, capHeight);
        ctx.fillRect(p.x - 5, bottomPipeY, pipeWidth + 10, capHeight);
    }

    // Pássaro (com rotação)
    ctx.save(); // Salva o estado do canvas (sem rotação)
    // Move o ponto de origem do canvas para o centro do pássaro
    ctx.translate(bird.x + bird.width / 2, bird.y + bird.height / 2);
    ctx.rotate(bird.rotation); // Rotaciona o canvas
    // Desenha a imagem do pássaro no centro do canvas rotacionado
    if (birdImages[0] && birdImages[0].complete && birdImages[0].naturalHeight !== 0) {
        ctx.drawImage(birdImages[0], -bird.width / 2, -bird.height / 2, bird.width, bird.height);
    } else {
        ctx.fillStyle = 'yellow';
        ctx.fillRect(-bird.width / 2, -bird.height / 2, bird.width, bird.height);
    }
    ctx.restore(); // Restaura o estado do canvas para o original

    
    // Textos de pontuação
    // ... (código dos textos não muda) ...
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 3;
    const largeFontSize = canvas.height * 0.08;
    const mediumFontSize = canvas.height * 0.05;
    const smallFontSize = canvas.height * 0.04;

    if (gameState === 'start') {
        ctx.font = `bold ${mediumFontSize}px Arial`;
        ctx.strokeText('Clique para Começar', canvas.width / 2, canvas.height / 2);
        ctx.fillText('Clique para Começar', canvas.width / 2, canvas.height / 2);
        if (highScore > 0) {
            ctx.font = `bold ${smallFontSize}px Arial`;
            ctx.strokeText(`Melhor: ${highScore}`, canvas.width / 2, canvas.height / 2 + 50);
            ctx.fillText(`Melhor: ${highScore}`, canvas.width / 2, canvas.height / 2 + 50);
        }
    }
    
    if (gameState === 'playing' || gameState === 'gameOver') {
        ctx.font = `bold ${largeFontSize}px Arial`;
        ctx.strokeText(score, canvas.width / 2, canvas.height * 0.15);
        ctx.fillText(score, canvas.width / 2, canvas.height * 0.15);
    }

    if (gameState === 'gameOver') {
        ctx.font = `bold ${mediumFontSize}px Arial`;
        ctx.strokeText('Game Over', canvas.width / 2, canvas.height / 2 - 50);
        ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2 - 50);
        ctx.font = `bold ${smallFontSize}px Arial`;
        ctx.strokeText(`Pontos: ${score}`, canvas.width / 2, canvas.height / 2);
        ctx.fillText(`Pontos: ${score}`, canvas.width / 2, canvas.height / 2);
        ctx.strokeText(`Melhor: ${highScore}`, canvas.width / 2, canvas.height / 2 + 40);
        ctx.fillText(`Melhor: ${highScore}`, canvas.width / 2, canvas.height / 2 + 40);
    }
}

function gameLoop() {
    if (gameState !== 'gameOver') updateGame();
    draw();
    requestAnimationFrame(gameLoop);
}

document.addEventListener('click', handleInput);
document.addEventListener('touchstart', (e) => { e.preventDefault(); handleInput(); });
document.addEventListener('keydown', (e) => { if (e.code === 'Space') { handleInput(); } });

window.addEventListener('resize', resetGame);

resetGame();
gameLoop();