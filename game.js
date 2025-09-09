// Arquivo: game.js - VERSÃO CORRIGIDA DO MENU

const canvas = document.getElementById('gameCanvas');
// CORREÇÃO CRÍTICA AQUI: Trocado 'd' por '2d'
const ctx = canvas.getContext('2d');

canvas.width = 405;
canvas.height = 720;

// --- ESTADO DO JOGO ---
let gameState = 'menu'; // 'menu', 'charSelect', 'playing', 'gameOver'

// --- CONFIGURAÇÕES GERAIS DO JOGO ---
const gravity = 0.35;
const jumpStrength = -7;
const pipeSpeed = 2.2;
const MIN_PIPE_GAP = 150;
const MAX_PIPE_GAP = 200;
const pipeInterval = 180;
let frameCount = 0;

// --- ELEMENTOS DO JOGO ---
let bird = {};
let pipes = [];
let pipeWidth = 80;
let score = 0;
let highScore = localStorage.getItem('flappyBoloHighScore') || 0;
let clouds = [];
let cityscape = [];
let particles = [];

// --- LÓGICA DE SELEÇÃO DE PERSONAGENS ---
const characters = [
    { color: '#FFD700', name: 'Bolo' },
    { color: '#ADD8E6', name: 'Azul' },
    { color: '#90EE90', name: 'Verde' }
];
let selectedCharacterIndex = 0;

// --- Definição de áreas de botões clicáveis ---
let menuButtons = {};
let charSelectButtons = {};

// --- FUNÇÕES DE LÓGICA E ESTADO ---
function changeState(newState) {
    gameState = newState;
    if (gameState === 'playing') {
        bird = { x: 80, y: 350, width: 48, height: 48, velocityY: 0, rotation: 0 };
        pipes = [];
        score = 0;
        frameCount = 0;
        generatePipe();
    }
}

function resetGame() {
    changeState('menu');
}


// --- FUNÇÃO DE INPUT (CLIQUE) ---
function handleInput(event) {
    const rect = canvas.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    if (gameState === 'menu') {
        if (isClickInsideRect({x: clickX, y: clickY}, menuButtons.play)) {
            changeState('charSelect');
        }
    } else if (gameState === 'charSelect') {
        charSelectButtons.chars.forEach((charButton, index) => {
            if (isClickInsideRect({x: clickX, y: clickY}, charButton)) {
                selectedCharacterIndex = index;
            }
        });
        if (isClickInsideRect({x: clickX, y: clickY}, charSelectButtons.play)) {
            changeState('playing');
        }
    } else if (gameState === 'playing') {
        bird.velocityY = jumpStrength;
        createFlapParticles();
    } else if (gameState === 'gameOver') {
        resetGame();
    }
}

function isClickInsideRect(click, rect) {
    return rect && click.x > rect.x && click.x < rect.x + rect.w &&
           click.y > rect.y && click.y < rect.y + rect.h;
}

// --- FUNÇÕES DE UPDATE ---
function update() {
    if (gameState !== 'playing') return;
    
    bird.velocityY += gravity;
    bird.y += bird.velocityY;
    if(bird.velocityY < 0) bird.rotation = -0.35;
    else { bird.rotation += 0.04; if(bird.rotation > 1.2) bird.rotation = 1.2; }

    if (bird.y > canvas.height || bird.y + bird.height < 0) {
        screenShake();
        if (score > highScore) { highScore = score; localStorage.setItem('flappyBoloHighScore', highScore); }
        changeState('gameOver');
    }

    frameCount++;
    if(frameCount % pipeInterval === 0) generatePipe();

    pipes.forEach(p => {
        p.x -= pipeSpeed;
        if (bird.x < p.x + pipeWidth && bird.x + bird.width > p.x && (bird.y < p.y || bird.y + bird.height > p.y + p.gap)) {
            screenShake();
            if (score > highScore) { highScore = score; localStorage.setItem('flappyBoloHighScore', highScore); }
            changeState('gameOver');
        }
        if(p.x + pipeWidth < bird.x && !p.passed){ score++; p.passed = true; }
    });
    pipes = pipes.filter(p => p.x + pipeWidth > 0);
    
    clouds.forEach(c => c.x -= pipeSpeed/4); clouds = clouds.filter(c => c.x + 100 < 0);
    cityscape.forEach(b => b.x -= pipeSpeed/5); cityscape = cityscape.filter(b => b.x + b.width > 0);
    particles.forEach(p => { p.x += p.vx; p.y += p.vy; p.life--; }); particles = particles.filter(p => p.life > 0);
}

// --- FUNÇÕES DE DESENHO (DRAW) ---
function drawMenu() {
    drawBackground();
    ctx.textAlign = 'center';
    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 8;
    
    ctx.font = 'bold 70px Arial';
    ctx.strokeText('Flappy Bolo', canvas.width / 2, 200);
    ctx.fillText('Flappy Bolo', canvas.width / 2, 200);

    const btnW = 220, btnH = 70, btnX = canvas.width/2 - btnW/2, btnY = 350;
    menuButtons.play = { x: btnX, y: btnY, w: btnW, h: btnH };
    ctx.fillStyle = '#73BF29';
    ctx.fillRect(btnX, btnY, btnW, btnH);
    ctx.fillStyle = 'white';
    ctx.font = 'bold 40px Arial';
    ctx.strokeText('Jogar', canvas.width/2, btnY + 50);
    ctx.fillText('Jogar', canvas.width/2, btnY + 50);

    ctx.font = '24px Arial';
    if(highScore > 0) ctx.fillText(`Melhor Pontuação: ${highScore}`, canvas.width / 2, 500);
}

function drawCharSelect() {
    drawBackground();
    ctx.textAlign = 'center';
    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 6;

    ctx.font = 'bold 36px Arial';
    ctx.strokeText('Escolha seu Personagem', canvas.width / 2, 150);
    ctx.fillText('Escolha seu Personagem', canvas.width / 2, 150);

    const startX = canvas.width / 2 - 120;
    charSelectButtons.chars = [];
    characters.forEach((char, index) => {
        const charX = startX + index * 120;
        const charY = 300;
        const radius = 40;
        charSelectButtons.chars.push({ x: charX - radius, y: charY - radius, w: radius*2, h: radius*2 });

        ctx.beginPath();
        ctx.arc(charX, charY, radius, 0, Math.PI * 2);
        ctx.fillStyle = char.color;
        ctx.fill();

        if (index === selectedCharacterIndex) {
            ctx.strokeStyle = 'yellow';
            ctx.lineWidth = 5;
            ctx.stroke();
        }
    });

    const btnW = 220, btnH = 70, btnX = canvas.width/2 - btnW/2, btnY = 500;
    charSelectButtons.play = { x: btnX, y: btnY, w: btnW, h: btnH };
    ctx.fillStyle = '#73BF29';
    ctx.fillRect(btnX, btnY, btnW, btnH);
    ctx.fillStyle = 'white';
    ctx.font = 'bold 40px Arial';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 8;
    ctx.strokeText('Jogar', canvas.width/2, btnY + 50);
    ctx.fillText('Jogar', canvas.width/2, btnY + 50);
}

function drawGame() {
    drawBackground();
    drawPipes();
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    particles.forEach(p => { ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2); ctx.fill(); });

    ctx.save();
    ctx.translate(bird.x + bird.width / 2, bird.y + bird.height / 2);
    ctx.rotate(bird.rotation);
    ctx.beginPath();
    ctx.arc(0, 0, bird.width/2, 0, Math.PI*2);
    ctx.fillStyle = characters[selectedCharacterIndex].color;
    ctx.fill();
    ctx.restore();
    
    ctx.fillStyle = 'white'; ctx.strokeStyle = 'black'; ctx.lineWidth = 5; ctx.textAlign = 'center';
    ctx.font = `bold 50px Arial`;
    ctx.strokeText(score, canvas.width/2, 80); ctx.fillText(score, canvas.width/2, 80);
}

function drawGameOver() {
    drawGame();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = 'white'; ctx.strokeStyle = 'black'; ctx.lineWidth = 5; ctx.textAlign = 'center';
    ctx.font = `bold 36px Arial`;
    ctx.strokeText('Game Over', canvas.width/2, canvas.height/2 - 60); ctx.fillText('Game Over', canvas.width/2, canvas.height/2 - 60);
    ctx.font = `bold 28px Arial`;
    ctx.strokeText(`Pontos: ${score}`, canvas.width/2, canvas.height/2 - 10); ctx.fillText(`Pontos: ${score}`, canvas.width/2, canvas.height/2 - 10);
    ctx.strokeText(`Melhor: ${highScore}`, canvas.width/2, canvas.height/2 + 30); ctx.fillText(`Melhor: ${highScore}`, canvas.width/2, canvas.height/2 + 30);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    switch (gameState) {
        case 'menu': drawMenu(); break;
        case 'charSelect': drawCharSelect(); break;
        case 'playing': drawGame(); break;
        case 'gameOver': drawGameOver(); break;
    }
}

function drawBackground() {
    const skyGradient = ctx.createLinearGradient(0,0,0,canvas.height);
    skyGradient.addColorStop(0, '#3a7bd5'); skyGradient.addColorStop(1, '#a6c1ee');
    ctx.fillStyle = skyGradient; ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle = '#1e3040'; cityscape.forEach(b => ctx.fillRect(b.x, b.y, b.width, b.height));
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'; clouds.forEach(c => ctx.fillRect(c.x, c.y, c.width, c.height));
}
function drawPipes() {
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
}

// --- LOOP PRINCIPAL E EVENTOS ---
function gameLoop() { update(); draw(); requestAnimationFrame(gameLoop); }

const style = document.createElement('style');
style.innerHTML = `@keyframes shake { 10%, 90% { transform: translate3d(-1px, 0, 0); } 20%, 80% { transform: translate3d(2px, 0, 0); } 30%, 50%, 70% { transform: translate3d(-4px, 0, 0); } 40%, 60% { transform: translate3d(4px, 0, 0); }}`;
document.head.appendChild(style);

canvas.addEventListener('click', handleInput);
resetGame();
gameLoop();

function generatePipe() { const newPipeGap = Math.random()*(MAX_PIPE_GAP-MIN_PIPE_GAP)+MIN_PIPE_GAP; const minHeight=60; const maxHeight=canvas.height-newPipeGap-100; let pipeY=Math.floor(Math.random()*(maxHeight-minHeight+1))+minHeight; pipes.push({x:canvas.width,y:pipeY,gap:newPipeGap,passed:false}); }
function generateCityscape() { let currentX = -40; while(currentX < canvas.width + 60){ const h = 70 + Math.random() * 100; const w = 30 + Math.random() * 40; cityscape.push({x:currentX, y:canvas.height-h, width:w, height:h}); currentX += w + 3; } }
function createFlapParticles() { for(let i=0; i<5; i++){ particles.push({ x: bird.x + bird.width/2, y: bird.y + bird.height/2, radius: Math.random()*2+1, vx: (Math.random()-0.5)*1.5, vy: Math.random()*1.5+0.5, life: 30 }); } }
function screenShake() { document.body.style.animation = 'shake 0.2s'; setTimeout(()=>document.body.style.animation = '', 200); }
function generateCloud() { const y=Math.random()*(canvas.height*0.6); const w=70+Math.random()*60; const h=25+Math.random()*15; clouds.push({x:canvas.width+w,y,width:w,height:h}); }
function generateInitialClouds() { for(let i=0;i<5;i++){const x=Math.random()*canvas.width; generateCloud(); clouds[clouds.length-1].x=x;} }