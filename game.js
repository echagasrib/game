// Arquivo: game.js - VERSÃO COM CORREÇÃO DE BUG E LAYOUT HÍBRIDO

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// ATUALIZADO: Função para ajustar o tamanho do canvas de forma inteligente
function resizeCanvas() {
    // Pega o tamanho que o CSS definiu para o canvas
    const { width, height } = canvas.getBoundingClientRect();
    // Ajusta a resolução interna do canvas para ser igual ao seu tamanho de exibição
    canvas.width = width;
    canvas.height = height;
    // Reseta o jogo para recalcular todas as posições
    resetGame();
}

// --- ESTADO DO JOGO ---
let gameState = 'start';

// --- VARIÁVEIS DO JOGO (FÍSICA AJUSTADA) ---
let gravity, jumpStrength, pipeSpeed, MIN_PIPE_GAP, MAX_PIPE_GAP, pipeInterval, pipeWidth;
let frameCount = 0;

// --- VARIÁVEIS DO PÁSSARO, CANOS, ETC ---
let bird = {};
const birdImages = [];
const numBirdFrames = 1;
let pipes = [];
let score = 0;
let highScore = localStorage.getItem('flappyBoloHighScore') || 0;
let clouds = [];
let stars = [];

// --- Funções de Cor e Desenho ---

// CORRIGIDO: Função de interpolação de cores mais robusta
function lerpColor(color1, color2, factor) {
    let r1 = parseInt(color1.substring(1, 3), 16);
    let g1 = parseInt(color1.substring(3, 5), 16);
    let b1 = parseInt(color1.substring(5, 7), 16);

    let r2 = parseInt(color2.substring(1, 3), 16);
    let g2 = parseInt(color2.substring(3, 5), 16);
    let b2 = parseInt(color2.substring(5, 7), 16);

    let r = Math.round(r1 + factor * (r2 - r1));
    let g = Math.round(g1 + factor * (g2 - g1));
    let b = Math.round(b1 + factor * (b2 - b1));

    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

function draw() {
    // Ciclo de dia e noite
    const dayTop = '#87CEEB', dayBottom = '#5D95E8';
    const sunsetTop = '#FF7E5F', sunsetBottom = '#FEB47B';
    const nightTop = '#000000', nightBottom = '#2c3e50';
    
    let topColor = dayTop, bottomColor = dayBottom;
    if (score >= 10 && score < 20) {
        const transition = (score - 10) / 10;
        topColor = lerpColor(dayTop, sunsetTop, transition);
        bottomColor = lerpColor(dayBottom, sunsetBottom, transition);
    } else if (score >= 20) {
        topColor = nightTop;
        bottomColor = nightBottom;
    }

    const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    skyGradient.addColorStop(0, topColor);
    skyGradient.addColorStop(1, bottomColor);
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // ... O resto do código de desenho ...
    ctx.fillStyle = 'white';
    for (const star of stars) { ctx.beginPath(); ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2); ctx.fill(); }

    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    for (const cloud of clouds) {
        ctx.beginPath();
        ctx.ellipse(cloud.x, cloud.y, cloud.width / 2, cloud.height / 2, 0, 0, Math.PI * 2);
        ctx.ellipse(cloud.x + cloud.width/4, cloud.y - cloud.height/2, cloud.width / 2.5, cloud.height / 2.5, 0, 0, Math.PI * 2);
        ctx.ellipse(cloud.x - cloud.width/4, cloud.y - cloud.height/3, cloud.width / 2.8, cloud.height / 2.8, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    for (let p of pipes) {
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

    ctx.save();
    ctx.translate(bird.x + bird.width / 2, bird.y + bird.height / 2);
    ctx.rotate(bird.rotation);
    if (birdImages[0] && birdImages[0].complete && birdImages[0].naturalHeight !== 0) { ctx.drawImage(birdImages[0], -bird.width / 2, -bird.height / 2, bird.width, bird.height); }
    else { ctx.fillStyle = 'yellow'; ctx.fillRect(-bird.width / 2, -bird.height / 2, bird.width, bird.height); }
    ctx.restore();
    
    const largeFontSize = canvas.height * 0.08;
    const mediumFontSize = canvas.height * 0.05;
    const smallFontSize = canvas.height * 0.04;
    
    if (gameState === 'playing' || gameState === 'gameOver') {
        ctx.font = `bold ${largeFontSize}px Arial`;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillText(score, canvas.width / 2 + 4, canvas.height * 0.15 + 4);
        ctx.fillStyle = 'white';
        ctx.fillText(score, canvas.width / 2, canvas.height * 0.15);
    }
    
    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 3;
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

// --- Funções de Lógica e Geração ---

function handleInput() { /* ... (sem mudanças) ... */ }
function updateGame() { /* ... (sem mudanças) ... */ }
function generatePipe() { /* ... (sem mudanças) ... */ }
function generateCloud() { /* ... (sem mudanças) ... */ }
function generateInitialClouds() { /* ... (sem mudanças) ... */ }
function generateStars(count) { /* ... (sem mudanças) ... */ }

function resetGame() {
    // ATUALIZADO: Todas as variáveis agora são recalculadas com base no tamanho da tela
    gravity = canvas.height * 0.00065; 
    jumpStrength = -(canvas.height * 0.012);
    pipeSpeed = canvas.width * 0.003;
    MIN_PIPE_GAP = canvas.height * 0.25;
    MAX_PIPE_GAP = canvas.height * 0.33;
    pipeInterval = 180; 
    pipeWidth = canvas.width * 0.18;
    
    bird = {
        x: canvas.width / 5,
        y: canvas.height / 3,
        width: canvas.width * 0.09,
        height: canvas.width * 0.09,
        velocityY: 0,
        rotation: 0
    };
    
    pipes = [];
    score = 0;
    frameCount = 0;
    gameState = 'start';
    clouds = []; 
    generateInitialClouds();
    stars = [];
    generatePipe(); 
}

// --- Loop Principal e Eventos ---

function gameLoop() {
    if (gameState !== 'gameOver') updateGame();
    draw();
    requestAnimationFrame(gameLoop);
}

// Garante que o jogo redimensione corretamente
window.addEventListener('resize', resizeCanvas);

// Inicia o jogo
for (let i = 0; i < numBirdFrames; i++) { const img = new Image(); img.src = `player_frame_${i}.png`; birdImages.push(img); }
resizeCanvas(); // Chamada inicial para configurar tudo
gameLoop();