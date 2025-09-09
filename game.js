// Arquivo: game.js - VERSÃO "DELUXE" (GRÁFICOS E JOGABILIDADE REFINADOS)

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// --- ESTADO DO JOGO ---
let gameState = 'start';

// --- VARIÁVEIS DO JOGO ---
const gravity = canvas.height * 0.00065; 
const jumpStrength = -(canvas.height * 0.012);
const pipeSpeed = canvas.width * 0.003;
// ATUALIZADO: Abertura dos canos aumentada para facilitar.
const MIN_PIPE_GAP = canvas.height * 0.25; // Mínimo de 25% da altura da tela
const MAX_PIPE_GAP = canvas.height * 0.33; // Máximo de 33% da altura da tela
const pipeInterval = 180; 
let frameCount = 0;

// --- VARIÁVEIS DO PÁSSARO ---
let bird = { x: canvas.width/5, y: canvas.height/3, width: canvas.width*0.09, height: canvas.width*0.09, velocityY: 0, rotation: 0 };
const birdImages = [];
const numBirdFrames = 1;
for (let i = 0; i < numBirdFrames; i++) { const img = new Image(); img.src = `player_frame_${i}.png`; birdImages.push(img); }

// --- VARIÁVEIS DOS CANOS, PONTUAÇÃO, NUVENS E ESTRELAS ---
let pipes = [];
let pipeWidth = canvas.width * 0.18;
let score = 0;
let highScore = localStorage.getItem('flappyBoloHighScore') || 0;
let clouds = [];
const cloudSpeed = pipeSpeed / 2;
let stars = []; // NOVO: Array para as estrelas

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
    bird.rotation = 0;
    pipes = [];
    score = 0;
    frameCount = 0;
    gameState = 'start';
    clouds = []; 
    generateInitialClouds();
    stars = []; // NOVO: Limpa as estrelas
    generatePipe(); 
}

// ATUALIZADO: Nuvens com aparência mais orgânica
function generateCloud() {
    const y = Math.random() * (canvas.height * 0.6);
    const baseWidth = 60 + Math.random() * 50;
    const baseHeight = 20 + Math.random() * 10;
    clouds.push({ x: canvas.width + baseWidth, y: y, width: baseWidth, height: baseHeight });
}
function generateInitialClouds() { for(let i = 0; i < 5; i++) { const x = Math.random() * canvas.width; generateCloud(); clouds[clouds.length-1].x = x; } }

// NOVO: Função para gerar estrelas
function generateStars(count) {
    for (let i = 0; i < count; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * 1.5
        });
    }
}

function generatePipe() {
    const newPipeGap = Math.random() * (MAX_PIPE_GAP - MIN_PIPE_GAP) + MIN_PIPE_GAP;
    const minHeight = canvas.height * 0.1;
    const maxHeight = canvas.height - newPipeGap - minHeight;
    let pipeY = Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;
    pipes.push({ x: canvas.width, y: pipeY, gap: newPipeGap, passed: false });
}

function updateGame() {
    // Pássaro
    bird.velocityY += gravity;
    bird.y += bird.velocityY;
    if (bird.velocityY < 0) bird.rotation = -0.3;
    else { bird.rotation += 0.05; if (bird.rotation > 1.2) bird.rotation = 1.2; }
    if (bird.y + bird.height > canvas.height || bird.y < 0) gameState = 'gameOver';

    // Canos e Nuvens
    frameCount++;
    if (frameCount % pipeInterval === 0) generatePipe();
    if (frameCount % 200 === 0) generateCloud();

    for (let i = pipes.length - 1; i >= 0; i--) { /* ... (lógica dos canos não muda) ... */
        let p = pipes[i]; p.x -= pipeSpeed;
        if (bird.x < p.x + pipeWidth && bird.x + bird.width > p.x && (bird.y < p.y || bird.y + bird.height > p.y + p.gap)) gameState = 'gameOver';
        if (p.x + pipeWidth < bird.x && !p.passed) { score++; p.passed = true; }
        if (p.x + pipeWidth < 0) pipes.splice(i, 1);
    }
    for (let i = clouds.length - 1; i >= 0; i--) { clouds[i].x -= cloudSpeed; if (clouds[i].x < -150) clouds.splice(i, 1); }
    
    // High Score
    if (gameState === 'gameOver' && score > highScore) { highScore = score; localStorage.setItem('flappyBoloHighScore', highScore); }

    // NOVO: Gera estrelas quando a pontuação atinge o nível da noite
    if (score === 20 && stars.length === 0) { // Gera estrelas uma vez
        generateStars(100);
    }
}

// NOVO: Função para interpolação de cores (para o pôr do sol)
function lerpColor(a, b, amount) { 
    const ar = a >> 16, ag = a >> 8 & 0xff, ab = a & 0xff,
          br = b >> 16, bg = b >> 8 & 0xff, bb = b & 0xff,
          rr = ar + amount * (br - ar),
          rg = ag + amount * (bg - ag),
          rb = ab + amount * (bb - ab);
    return `#${((1 << 24) + (rr << 16) + (rg << 8) + rb | 0).toString(16).slice(1)}`;
}


function draw() {
    // ATUALIZADO: Fundo com ciclo de dia e noite
    const dayTop = 0x87CEEB, dayBottom = 0x5D95E8;
    const sunsetTop = 0xFF7E5F, sunsetBottom = 0xFEB47B;
    const nightTop = 0x000000, nightBottom = 0x2c3e50;
    
    let topColor = dayTop, bottomColor = dayBottom;

    if (score >= 10 && score < 20) { // Transição para o pôr do sol
        const transition = (score - 10) / 10;
        topColor = lerpColor(dayTop, sunsetTop, transition);
        bottomColor = lerpColor(dayBottom, sunsetBottom, transition);
    } else if (score >= 20) { // Noite
        topColor = nightTop;
        bottomColor = nightBottom;
    }

    const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    skyGradient.addColorStop(0, topColor);
    skyGradient.addColorStop(1, bottomColor);
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // NOVO: Desenha as estrelas se elas existirem
    ctx.fillStyle = 'white';
    for (const star of stars) { ctx.beginPath(); ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2); ctx.fill(); }

    // ATUALIZADO: Nuvens com aparência melhorada
    for (const cloud of clouds) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.beginPath();
        ctx.ellipse(cloud.x, cloud.y, cloud.width / 2, cloud.height / 2, 0, 0, Math.PI * 2);
        ctx.ellipse(cloud.x + cloud.width/4, cloud.y - cloud.height/2, cloud.width / 2.5, cloud.height / 2.5, 0, 0, Math.PI * 2);
        ctx.ellipse(cloud.x - cloud.width/4, cloud.y - cloud.height/3, cloud.width / 2.8, cloud.height / 2.8, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    // Canos
    for (let p of pipes) { // ... (código dos canos não muda) ...
        const pipeGradient = ctx.createLinearGradient(p.x, 0, p.x + pipeWidth, 0);
        pipeGradient.addColorStop(0, '#55801F'); pipeGradient.addColorStop(0.5, '#73BF29'); pipeGradient.addColorStop(1, '#55801F');
        const topPipeHeight = p.y; const bottomPipeY = p.y + p.gap;
        ctx.fillStyle = pipeGradient;
        ctx.fillRect(p.x, 0, pipeWidth, topPipeHeight);
        ctx.fillRect(p.x, bottomPipeY, pipeWidth, canvas.height - bottomPipeY);
        const capHeight = canvas.height * 0.04;
        ctx.fillRect(p.x - 5, topPipeHeight - capHeight, pipeWidth + 10, capHeight);
        ctx.fillRect(p.x - 5, bottomPipeY, pipeWidth + 10, capHeight);
    }

    // Pássaro com rotação
    ctx.save();
    ctx.translate(bird.x + bird.width / 2, bird.y + bird.height / 2);
    ctx.rotate(bird.rotation);
    if (birdImages[0] && birdImages[0].complete && birdImages[0].naturalHeight !== 0) { ctx.drawImage(birdImages[0], -bird.width / 2, -bird.height / 2, bird.width, bird.height); }
    else { ctx.fillStyle = 'yellow'; ctx.fillRect(-bird.width / 2, -bird.height / 2, bird.width, bird.height); }
    ctx.restore();
    
    // Textos
    ctx.textAlign = 'center';
    ctx.lineWidth = 3;
    const largeFontSize = canvas.height * 0.08;
    const mediumFontSize = canvas.height * 0.05;
    const smallFontSize = canvas.height * 0.04;
    
    // ATUALIZADO: Desenho do placar com sombra
    if (gameState === 'playing' || gameState === 'gameOver') {
        ctx.font = `bold ${largeFontSize}px Arial`;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'; // Sombra
        ctx.fillText(score, canvas.width / 2 + 4, canvas.height * 0.15 + 4);
        ctx.fillStyle = 'white'; // Texto principal
        ctx.fillText(score, canvas.width / 2, canvas.height * 0.15);
    }
    
    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'black';
    if (gameState === 'start') { // ... (textos de start e game over não mudam a lógica)
        ctx.font = `bold ${mediumFontSize}px Arial`;
        ctx.strokeText('Clique para Começar', canvas.width / 2, canvas.height / 2);
        ctx.fillText('Clique para Começar', canvas.width / 2, canvas.height / 2);
        if (highScore > 0) {
            ctx.font = `bold ${smallFontSize}px Arial`;
            ctx.strokeText(`Melhor: ${highScore}`, canvas.width / 2, canvas.height / 2 + 50);
            ctx.fillText(`Melhor: ${highScore}`, canvas.width / 2, canvas.height / 2 + 50);
        }
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