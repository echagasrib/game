// Arquivo: game.js - VERSÃO ESTÁVEL (TELA 405x720) COM POLIMENTO FINAL

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// --- ESTADO DO JOGO ---
let gameState = 'start';

// --- VARIÁVEIS DO JOGO (Valores ajustados para a nova resolução de 405x720) ---
const gravity = 0.35;
const jumpStrength = -7;
const pipeSpeed = 2.2;
const MIN_PIPE_GAP = 150;
const MAX_PIPE_GAP = 200;
const pipeInterval = 180;
let frameCount = 0;

// --- VARIÁVEIS DOS ELEMENTOS ---
let bird = {};
const birdImages = [];
const numBirdFrames = 1;
let pipes = [];
let pipeWidth = 80;
let score = 0;
let highScore = localStorage.getItem('flappyBoloHighScore') || 0;
let clouds = [];
let cityscape = [];
let particles = [];

// --- FUNÇÕES DE INICIALIZAÇÃO E RESET ---
function resetGame() {
    gameState = 'start';
    bird = { x: 80, y: 250, width: 48, height: 48, velocityY: 0, rotation: 0 };
    pipes = [];
    score = 0;
    frameCount = 0;
    clouds = [];
    cityscape = [];
    generateInitialClouds();
    generateCityscape();
    generatePipe();
}

// --- FUNÇÕES DE GERAÇÃO DE ELEMENTOS ---
function generatePipe() { const newPipeGap = Math.random()*(MAX_PIPE_GAP-MIN_PIPE_GAP)+MIN_PIPE_GAP; const minHeight=60; const maxHeight=canvas.height-newPipeGap-100; let pipeY=Math.floor(Math.random()*(maxHeight-minHeight+1))+minHeight; pipes.push({x:canvas.width,y:pipeY,gap:newPipeGap,passed:false}); }
function generateCloud() { const y=Math.random()*(canvas.height*0.6); const w=70+Math.random()*60; const h=25+Math.random()*15; clouds.push({x:canvas.width+w,y,width:w,height:h}); }
function generateInitialClouds() { for(let i=0;i<5;i++){const x=Math.random()*canvas.width; generateCloud(); clouds[clouds.length-1].x=x;} }
function generateCityscape() { let currentX = -40; while(currentX < canvas.width + 60){ const h = 70 + Math.random() * 100; const w = 30 + Math.random() * 40; cityscape.push({x:currentX, y:canvas.height-h, width:w, height:h}); currentX += w + 3; } }
function createFlapParticles() { for(let i=0; i<5; i++){ particles.push({ x: bird.x + bird.width/2, y: bird.y + bird.height/2, radius: Math.random()*2+1, vx: (Math.random()-0.5)*1.5, vy: Math.random()*1.5+0.5, life: 30 }); } }
function screenShake() { document.body.style.animation = 'shake 0.2s'; setTimeout(()=>document.body.style.animation = '', 200); }


// --- FUNÇÕES DE LÓGICA (UPDATE) ---
function handleInput() {
    if (gameState === 'start') gameState = 'playing';
    if (gameState === 'playing') {
        bird.velocityY = jumpStrength;
        createFlapParticles();
    }
    if (gameState === 'gameOver') resetGame();
}

function updateGame() {
    if (gameState !== 'playing') return;
    
    bird.velocityY += gravity; bird.y += bird.velocityY;
    if(bird.velocityY < 0) bird.rotation = -0.35; else { bird.rotation += 0.04; if(bird.rotation > 1.2) bird.rotation = 1.2; }
    if (bird.y > canvas.height || bird.y + bird.height < 0) { screenShake(); gameState = 'gameOver'; }

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
    
    const skyGradient = ctx.createLinearGradient(0,0,0,canvas.height);
    skyGradient.addColorStop(0, '#3a7bd5'); skyGradient.addColorStop(1, '#a6c1ee');
    ctx.fillStyle = skyGradient; ctx.fillRect(0,0,canvas.width,canvas.height);
    
    ctx.fillStyle = '#1e3040'; cityscape.forEach(b => ctx.fillRect(b.x, b.y, b.width, b.height));
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'; clouds.forEach(c => ctx.fillRect(c.x, c.y, c.width, c.height));
    
    pipes.forEach(p => {
        const pipeGradient = ctx.createLinearGradient(p.x,0,p.x+pipeWidth,0);
        pipeGradient.addColorStop(0,'#55801F'); pipeGradient.addColorStop(0.5,'#73BF29'); pipeGradient.addColorStop(1,'#55801F');
        ctx.fillStyle = pipeGradient;
        const capH = 30;
        ctx.fillRect(p.x, 0, pipeWidth, p.y);
        ctx.fillRect(p.x, p.y + p.gap, pipeWidth, canvas.height - (p.y + p.gap));
        ctx.fillRect(p.x - 5, p.y - capH, pipeWidth + 10, capH);
        ctx.fillRect(p.x - 5, p.y + p.gap, pipeWidth + 10, capH);
    });
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'; particles.forEach(p => { ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2); ctx.fill(); });

    ctx.save();
    ctx.translate(bird.x + bird.width / 2, bird.y + bird.height / 2);
    ctx.rotate(bird.rotation);
    if (birdImages[0] && birdImages[0].complete) { ctx.drawImage(birdImages[0], -bird.width / 2, -bird.height / 2, bird.width, bird.height); }
    ctx.restore();
    
    const largeFontSize=50, mediumFontSize=36, smallFontSize=28;
    ctx.fillStyle = 'white'; ctx.strokeStyle = 'black'; ctx.lineWidth = 5; ctx.textAlign = 'center';

    if (gameState === 'playing' || gameState === 'gameOver') { ctx.font = `bold ${largeFontSize}px Arial`; ctx.strokeText(score, canvas.width/2, 80); ctx.fillText(score, canvas.width/2, 80); }
    if (gameState === 'start') {
        ctx.font = `bold ${mediumFontSize}px Arial`;
        ctx.strokeText('Clique para Começar', canvas.width/2, canvas.height/2 - 40);
        ctx.fillText('Clique para Começar', canvas.width/2, canvas.height/2 - 40);
        if (highScore > 0) { ctx.font = `bold ${smallFontSize}px Arial`; ctx.strokeText(`Melhor: ${highScore}`, canvas.width/2, canvas.height/2 + 20); ctx.fillText(`Melhor: ${highScore}`, canvas.width/2, canvas.height/2 + 20); }
    }
    if (gameState === 'gameOver') {
        ctx.font = `bold ${mediumFontSize}px Arial`;
        ctx.strokeText('Game Over', canvas.width/2, canvas.height/2 - 60);
        ctx.fillText('Game Over', canvas.widh/2, canvas.height/2 - 60);
        ctx.font = `bold ${smallFontSize}px Arial`;
        ctx.strokeText(`Pontos: ${score}`, canvas.width/2, canvas.height/2 - 10);
        ctx.fillText(`Pontos: ${score}`, canvas.width/2, canvas.height/2 - 10);
        ctx.strokeText(`Melhor: ${highScore}`, canvas.width/2, canvas.height/2 + 30);
        ctx.fillText(`Melhor: ${highScore}`, canvas.width/2, canvas.height/2 + 30);
    }
}

// --- LOOP PRINCIPAL E EVENTOS ---
function gameLoop() {
    updateGame();
    draw();
    requestAnimationFrame(gameLoop);
}

const style = document.createElement('style');
style.innerHTML = `@keyframes shake { 10%, 90% { transform: translate3d(-1px, 0, 0); } 20%, 80% { transform: translate3d(2px, 0, 0); } 30%, 50%, 70% { transform: translate3d(-4px, 0, 0); } 40%, 60% { transform: translate3d(4px, 0, 0); }}`;
document.head.appendChild(style);

document.addEventListener('click', handleInput);
document.addEventListener('touchstart', (e) => { e.preventDefault(); handleInput(); });
for(let i=0; i<numBirdFrames; i++) { const img=new Image(); img.src=`player_frame_${i}.png`; birdImages.push(img); }
resetGame();
gameLoop();