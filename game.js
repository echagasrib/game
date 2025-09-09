// Arquivo: game.js - GRÁFICOS NOVOS COM ESTRUTURA FIXA E ESTÁVEL

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// --- ESTADO DO JOGO ---
let gameState = 'start';

// --- VARIÁVEIS DO JOGO ---
// REVERTIDO: Voltamos para valores fixos em pixels para máxima compatibilidade
const gravity = 0.3; 
const jumpStrength = -6;
const pipeSpeed = 1.8;
const MIN_PIPE_GAP = 110; 
const MAX_PIPE_GAP = 150;
const pipeInterval = 180; 
let frameCount = 0;

// --- VARIÁVEIS DO PÁSSARO ---
let bird = { x: 50, y: 150, width: 34, height: 34, velocityY: 0, rotation: 0 };
const birdImages = [];
const numBirdFrames = 1;
for (let i = 0; i < numBirdFrames; i++) { const img = new Image(); img.src = `player_frame_${i}.png`; birdImages.push(img); }

// --- VARIÁVEIS DOS CANOS, PONTUAÇÃO, NUVENS E ESTRELAS ---
let pipes = [];
let pipeWidth = 55;
let score = 0;
let highScore = localStorage.getItem('flappyBoloHighScore') || 0;
let clouds = [];
const cloudSpeed = pipeSpeed / 2;
let stars = [];

// --- Funções de Cor e Desenho ---
function lerpColor(color1, color2, factor) {
    let r1 = parseInt(color1.substring(1, 3), 16); let g1 = parseInt(color1.substring(3, 5), 16); let b1 = parseInt(color1.substring(5, 7), 16);
    let r2 = parseInt(color2.substring(1, 3), 16); let g2 = parseInt(color2.substring(3, 5), 16); let b2 = parseInt(color2.substring(5, 7), 16);
    let r = Math.round(r1 + factor * (r2 - r1)); let g = Math.round(g1 + factor * (g2 - g1)); let b = Math.round(b1 + factor * (b2 - b1));
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

function draw() {
    // Ciclo de dia e noite
    const dayTop = '#87CEEB', dayBottom = '#5D95E8', sunsetTop = '#FF7E5F', sunsetBottom = '#FEB47B', nightTop = '#000000', nightBottom = '#2c3e50';
    let topColor = dayTop, bottomColor = dayBottom;
    if (score >= 10 && score < 20) {
        const transition = (score - 10) / 10;
        topColor = lerpColor(dayTop, sunsetTop, transition); bottomColor = lerpColor(dayBottom, sunsetBottom, transition);
    } else if (score >= 20) { topColor = nightTop; bottomColor = nightBottom; }

    const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    skyGradient.addColorStop(0, topColor); skyGradient.addColorStop(1, bottomColor);
    ctx.fillStyle = skyGradient; ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Nuvens e Estrelas
    ctx.fillStyle = 'white'; for (const star of stars) { ctx.beginPath(); ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2); ctx.fill(); }
    for (const cloud of clouds) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'; ctx.beginPath();
        ctx.ellipse(cloud.x, cloud.y, cloud.width / 2, cloud.height / 2, 0, 0, Math.PI * 2);
        ctx.ellipse(cloud.x + cloud.width/4, cloud.y - cloud.height/2, cloud.width / 2.5, cloud.height / 2.5, 0, 0, Math.PI * 2);
        ctx.ellipse(cloud.x - cloud.width/4, cloud.y - cloud.height/3, cloud.width / 2.8, cloud.height / 2.8, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    // Canos
    for (let p of pipes) {
        const pipeGradient = ctx.createLinearGradient(p.x, 0, p.x + pipeWidth, 0);
        pipeGradient.addColorStop(0, '#55801F'); pipeGradient.addColorStop(0.5, '#73BF29'); pipeGradient.addColorStop(1, '#55801F');
        const topPipeHeight = p.y; const bottomPipeY = p.y + p.gap;
        ctx.fillStyle = pipeGradient;
        ctx.fillRect(p.x, 0, pipeWidth, topPipeHeight); ctx.fillRect(p.x, bottomPipeY, pipeWidth, canvas.height - bottomPipeY);
        const capHeight = 20;
        ctx.fillRect(p.x - 5, topPipeHeight - capHeight, pipeWidth + 10, capHeight); ctx.fillRect(p.x - 5, bottomPipeY, pipeWidth + 10, capHeight);
    }

    // Pássaro com rotação
    ctx.save();
    ctx.translate(bird.x + bird.width / 2, bird.y + bird.height / 2);
    ctx.rotate(bird.rotation);
    if (birdImages[0] && birdImages[0].complete && birdImages[0].naturalHeight !== 0) { ctx.drawImage(birdImages[0], -bird.width / 2, -bird.height / 2, bird.width, bird.height); }
    else { ctx.fillStyle = 'yellow'; ctx.fillRect(-bird.width / 2, -bird.height / 2, bird.width, bird.height); }
    ctx.restore();
    
    // Textos
    const largeFontSize = 40, mediumFontSize = 28, smallFontSize = 22;
    ctx.fillStyle = 'white'; ctx.strokeStyle = 'black'; ctx.lineWidth = 3; ctx.textAlign = 'center';
    
    if (gameState === 'playing' || gameState === 'gameOver') {
        ctx.font = `bold ${largeFontSize}px Arial`;
        ctx.strokeText(score, canvas.width / 2, 60); ctx.fillText(score, canvas.width / 2, 60);
    }
    
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

function handleInput() { if (gameState === 'start') gameState = 'playing'; if (gameState === 'playing') bird.velocityY = jumpStrength; if (gameState === 'gameOver') resetGame(); }

function generatePipe() {
    const newPipeGap = Math.random() * (MAX_PIPE_GAP - MIN_PIPE_GAP) + MIN_PIPE_GAP;
    const minHeight = 50; const maxHeight = canvas.height - newPipeGap - 50;
    let pipeY = Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;
    pipes.push({ x: canvas.width, y: pipeY, gap: newPipeGap, passed: false });
}

function generateCloud() { const y = Math.random() * (canvas.height * 0.6); const baseWidth = 60 + Math.random() * 50; const baseHeight = 20 + Math.random() * 10; clouds.push({ x: canvas.width + baseWidth, y: y, width: baseWidth, height: baseHeight });}
function generateInitialClouds() { for(let i = 0; i < 5; i++) { const x = Math.random() * canvas.width; generateCloud(); clouds[clouds.length-1].x = x; } }
function generateStars(count) { for (let i = 0; i < count; i++) { stars.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, radius: Math.random() * 1.5 }); } }

function updateGame() {
    bird.velocityY += gravity; bird.y += bird.velocityY;
    if (bird.velocityY < 0) bird.rotation = -0.3; else { bird.rotation += 0.05; if (bird.rotation > 1.2) bird.rotation = 1.2; }
    if (bird.y + bird.height > canvas.height || bird.y < 0) gameState = 'gameOver';

    frameCount++;
    if (frameCount % pipeInterval === 0) generatePipe();
    if (frameCount % 200 === 0) generateCloud();
    if (score === 20 && stars.length === 0) generateStars(100);

    for (let i = pipes.length - 1; i >= 0; i--) { let p = pipes[i]; p.x -= pipeSpeed; if (bird.x < p.x + pipeWidth && bird.x + bird.width > p.x && (bird.y < p.y || bird.y + bird.height > p.y + p.gap)) gameState = 'gameOver'; if (p.x + pipeWidth < bird.x && !p.passed) { score++; p.passed = true; } if (p.x + pipeWidth < 0) pipes.splice(i, 1); }
    for (let i = clouds.length - 1; i >= 0; i--) { clouds[i].x -= cloudSpeed; if (clouds[i].x < -150) clouds.splice(i, 1); }
    if (gameState === 'gameOver' && score > highScore) { highScore = score; localStorage.setItem('flappyBoloHighScore', highScore); }
}

function resetGame() {
    bird.y = 150; bird.velocityY = 0; bird.rotation = 0;
    pipes = []; score = 0; frameCount = 0; gameState = 'start';
    clouds = []; generateInitialClouds(); stars = [];
    generatePipe(); 
}

// --- Loop Principal e Eventos ---
function gameLoop() { if (gameState !== 'gameOver') updateGame(); draw(); requestAnimationFrame(gameLoop); }

document.addEventListener('click', handleInput);
document.addEventListener('touchstart', (e) => { e.preventDefault(); handleInput(); });
document.addEventListener('keydown', (e) => { if (e.code === 'Space') { handleInput(); } });

// REVERTIDO: Não precisamos mais ouvir o evento 'resize'
// window.addEventListener('resize', resizeCanvas); 

// Inicia o Jogo
resetGame();
gameLoop();