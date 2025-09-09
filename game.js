// Arquivo: game.js - VERSÃO FINAL (TELA CHEIA ESTÁVEL + POLIMENTO EXTRA)

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// ATUALIZADO: Usamos uma resolução virtual fixa para estabilidade
const VIRTUAL_WIDTH = 288;
const VIRTUAL_HEIGHT = 512;

canvas.width = VIRTUAL_WIDTH;
canvas.height = VIRTUAL_HEIGHT;

let scale = 1; // Fator de escala para a tela cheia

// --- ESTADO DO JOGO ---
let gameState = 'start';

// --- VARIÁVEIS DO JOGO (Valores fixos baseados na resolução virtual) ---
const gravity = 0.25;
const jumpStrength = -5;
let pipeSpeed = 1.5;
const MIN_PIPE_GAP = 100;
const MAX_PIPE_GAP = 140;
const pipeInterval = 200; // Aumentei um pouco mais para dar mais respiro
let frameCount = 0;

// --- VARIÁVEIS DOS ELEMENTOS ---
let bird = {};
const birdImages = [];
const numBirdFrames = 1;
let pipes = [];
let pipeWidth = 55;
let score = 0;
let highScore = localStorage.getItem('flappyBoloHighScore') || 0;
let clouds = [];
let cityscape = []; // NOVO: Array para a cidade no fundo
let particles = []; // NOVO: Array para partículas de pulo

// --- FUNÇÕES DE INICIALIZAÇÃO E RESET ---
function resetGame() {
    gameState = 'start';
    bird = { x: 60, y: 180, width: 34, height: 34, velocityY: 0, rotation: 0 };
    pipes = [];
    score = 0;
    frameCount = 0;
    clouds = [];
    cityscape = [];
    generateInitialClouds();
    generateCityscape();
    generatePipe();
}

function resizeAndScale() {
    const aspectRatio = VIRTUAL_WIDTH / VIRTUAL_HEIGHT;
    const windowRatio = window.innerWidth / window.innerHeight;
    
    if (windowRatio > aspectRatio) {
        // Janela mais larga que o jogo
        canvas.height = window.innerHeight;
        canvas.width = canvas.height * aspectRatio;
    } else {
        // Janela mais alta que o jogo
        canvas.width = window.innerWidth;
        canvas.height = canvas.width / aspectRatio;
    }
    scale = canvas.width / VIRTUAL_WIDTH;
}


// --- FUNÇÕES DE GERAÇÃO DE ELEMENTOS ---
function generatePipe() { const newPipeGap = Math.random()*(MAX_PIPE_GAP-MIN_PIPE_GAP)+MIN_PIPE_GAP; const minHeight=40; const maxHeight=VIRTUAL_HEIGHT-newPipeGap-80; let pipeY=Math.floor(Math.random()*(maxHeight-minHeight+1))+minHeight; pipes.push({x:VIRTUAL_WIDTH,y:pipeY,gap:newPipeGap,passed:false}); }
function generateCloud() { const y=Math.random()*(VIRTUAL_HEIGHT*0.5); const w=50+Math.random()*40; const h=20+Math.random()*10; clouds.push({x:VIRTUAL_WIDTH+w,y,width:w,height:h}); }
function generateInitialClouds() { for(let i=0;i<5;i++){const x=Math.random()*VIRTUAL_WIDTH; generateCloud(); clouds[clouds.length-1].x=x;} }
function generateCityscape() { let currentX = -30; while(currentX < VIRTUAL_WIDTH + 50){ const h = 50 + Math.random() * 80; const w = 20 + Math.random() * 30; cityscape.push({x:currentX, y:VIRTUAL_HEIGHT-h, width:w, height:h}); currentX += w + 2; } }

// NOVO: Função para criar partículas de pulo
function createFlapParticles() { for(let i=0; i<5; i++){ particles.push({ x: bird.x, y: bird.y + bird.height, radius: Math.random()*2+1, vx: (Math.random()-0.5)*1.5, vy: Math.random()*1.5+0.5, life: 30 }); } }
// NOVO: Função de tremer a tela
function screenShake() { document.body.style.animation = 'shake 0.2s'; setTimeout(()=>document.body.style.animation = '', 200); }


// --- FUNÇÕES DE LÓGICA (UPDATE) ---
function handleInput() {
    if (gameState === 'start') gameState = 'playing';
    if (gameState === 'playing') {
        bird.velocityY = jumpStrength;
        createFlapParticles(); // Cria partículas ao pular
    }
    if (gameState === 'gameOver') resetGame();
}

function updateGame() {
    // Pássaro
    bird.velocityY += gravity; bird.y += bird.velocityY;
    if(bird.velocityY < 0) bird.rotation = -0.3; else { bird.rotation += 0.04; if(bird.rotation > 1) bird.rotation = 1; }
    if (bird.y > VIRTUAL_HEIGHT || bird.y + bird.height < 0) { screenShake(); gameState = 'gameOver'; }

    // Canos, Nuvens, Cidade, Partículas
    if (gameState !== 'playing') return;
    frameCount++;
    if(frameCount % pipeInterval === 0) generatePipe();
    if(frameCount % 250 === 0) generateCloud();

    pipes.forEach(p => { p.x -= pipeSpeed; if (bird.x<p.x+pipeWidth && bird.x+bird.width>p.x && (bird.y<p.y || bird.y+bird.height>p.y+p.gap)) { screenShake(); gameState = 'gameOver'; } if(p.x+pipeWidth<bird.x && !p.passed){score++; p.passed=true;} });
    pipes = pipes.filter(p => p.x + pipeWidth > 0);
    clouds.forEach(c => c.x -= pipeSpeed/3); clouds = clouds.filter(c => c.x + c.width > 0);
    cityscape.forEach(b => b.x -= pipeSpeed/4); cityscape = cityscape.filter(b => b.x + b.width > 0);
    particles.forEach(p => { p.x += p.vx; p.y += p.vy; p.life--; }); particles = particles.filter(p => p.life > 0);

    if (score > highScore) { highScore = score; localStorage.setItem('flappyBoloHighScore', highScore); }
}

// --- FUNÇÃO DE DESENHO ---
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // ATUALIZADO: Aplica a escala para preencher a tela
    ctx.save();
    ctx.scale(scale, scale);

    // Fundo com Gradiente
    const skyGradient = ctx.createLinearGradient(0,0,0,VIRTUAL_HEIGHT);
    skyGradient.addColorStop(0, '#3a7bd5'); skyGradient.addColorStop(1, '#a6c1ee');
    ctx.fillStyle = skyGradient; ctx.fillRect(0,0,VIRTUAL_WIDTH,VIRTUAL_HEIGHT);
    
    // Cidade no fundo (Paralaxe)
    ctx.fillStyle = '#1e3040';
    cityscape.forEach(b => ctx.fillRect(b.x, b.y, b.width, b.height));

    // Nuvens
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    clouds.forEach(c => ctx.fillRect(c.x, c.y, c.width, c.height));
    
    // Canos
    pipes.forEach(p => {
        const pipeGradient = ctx.createLinearGradient(p.x,0,p.x+pipeWidth,0);
        pipeGradient.addColorStop(0,'#55801F'); pipeGradient.addColorStop(0.5,'#73BF29'); pipeGradient.addColorStop(1,'#55801F');
        ctx.fillStyle = pipeGradient;
        ctx.fillRect(p.x, 0, pipeWidth, p.y);
        ctx.fillRect(p.x, p.y + p.gap, pipeWidth, VIRTUAL_HEIGHT - (p.y + p.gap));
        const capH = 20;
        ctx.fillRect(p.x - 5, p.y - capH, pipeWidth + 10, capH);
        ctx.fillRect(p.x - 5, p.y + p.gap, pipeWidth + 10, capH);
    });
    
    // Partículas de Pulo
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    particles.forEach(p => { ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2); ctx.fill(); });

    // Pássaro
    ctx.save();
    ctx.translate(bird.x + bird.width / 2, bird.y + bird.height / 2);
    ctx.rotate(bird.rotation);
    if (birdImages[0] && birdImages[0].complete) { ctx.drawImage(birdImages[0], -bird.width / 2, -bird.height / 2, bird.width, bird.height); }
    ctx.restore();
    
    // Textos
    const largeFontSize=40, mediumFontSize=28, smallFontSize=22;
    ctx.fillStyle = 'white'; ctx.strokeStyle = 'black'; ctx.lineWidth = 4; ctx.textAlign = 'center';

    if (gameState === 'playing' || gameState === 'gameOver') {
        ctx.font = `bold ${largeFontSize}px Arial`;
        ctx.strokeText(score, VIRTUAL_WIDTH/2, 60); ctx.fillText(score, VIRTUAL_WIDTH/2, 60);
    }
    if (gameState === 'start') {
        ctx.font = `bold ${mediumFontSize}px Arial`;
        ctx.strokeText('Clique para Começar', VIRTUAL_WIDTH/2, VIRTUAL_HEIGHT/2 - 20);
        ctx.fillText('Clique para Começar', VIRTUAL_WIDTH/2, VIRTUAL_HEIGHT/2 - 20);
        if (highScore > 0) { ctx.font = `bold ${smallFontSize}px Arial`; ctx.strokeText(`Melhor: ${highScore}`, VIRTUAL_WIDTH/2, VIRTUAL_HEIGHT/2 + 30); ctx.fillText(`Melhor: ${highScore}`, VIRTUAL_WIDTH/2, VIRTUAL_HEIGHT/2 + 30); }
    }
    if (gameState === 'gameOver') {
        ctx.font = `bold ${mediumFontSize}px Arial`;
        ctx.strokeText('Game Over', VIRTUAL_WIDTH/2, VIRTUAL_HEIGHT/2 - 40);
        ctx.fillText('Game Over', VIRTUAL_WIDTH/2, VIRTUAL_HEIGHT/2 - 40);
        ctx.font = `bold ${smallFontSize}px Arial`;
        ctx.strokeText(`Pontos: ${score}`, VIRTUAL_WIDTH/2, VIRTUAL_HEIGHT/2);
        ctx.fillText(`Pontos: ${score}`, VIRTUAL_WIDTH/2, VIRTUAL_HEIGHT/2);
        ctx.strokeText(`Melhor: ${highScore}`, VIRTUAL_WIDTH/2, VIRTUAL_HEIGHT/2 + 40);
        ctx.fillText(`Melhor: ${highScore}`, VIRTUAL_WIDTH/2, VIRTUAL_HEIGHT/2 + 40);
    }
    
    ctx.restore(); // Restaura o estado do canvas após a escala
}

// --- LOOP PRINCIPAL E EVENTOS ---
function gameLoop() {
    updateGame();
    draw();
    requestAnimationFrame(gameLoop);
}

// Adiciona um pouco de CSS para a animação de tremer a tela
const style = document.createElement('style');
style.innerHTML = `@keyframes shake { 10%, 90% { transform: translate3d(-1px, 0, 0); } 20%, 80% { transform: translate3d(2px, 0, 0); } 30%, 50%, 70% { transform: translate3d(-4px, 0, 0); } 40%, 60% { transform: translate3d(4px, 0, 0); }}`;
document.head.appendChild(style);

window.addEventListener('resize', resizeAndScale);
for(let i=0; i<numBirdFrames; i++) { const img=new Image(); img.src=`player_frame_${i}.png`; birdImages.push(img); }
resizeAndScale(); // Configura a escala inicial
resetGame();
gameLoop();