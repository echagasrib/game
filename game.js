// Arquivo: game.js - VERSÃO COM 3 PERSONAGENS CUSTOMIZADOS

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 405;
canvas.height = 720;

// --- ESTADO DO JOGO ---
let gameState = 'menu';

// --- CONFIGURAÇÕES GERAIS ---
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
let mountains = [];
let particles = [];

// --- LÓGICA DE PERSONAGENS ---
// ATUALIZADO: Carregando as três novas imagens
const player1_img = new Image();
player1_img.src = 'player_1.png';

const player2_img = new Image();
player2_img.src = 'player_2.png';

const player3_img = new Image();
player3_img.src = 'player_3.png';


// ATUALIZADO: A lista de personagens agora usa suas 3 imagens
const characters = [
    { image: player1_img, name: 'Player 1', obstacleType: 'pipes' },
    { image: player2_img, name: 'Player 2', obstacleType: 'buildings' },
    { image: player3_img, name: 'Player 3', obstacleType: 'pipes' }
];
let selectedCharacterIndex = 0;
let menuButtons = {}, charSelectButtons = {};

// --- FUNÇÕES DE LÓGICA E ESTADO ---
function changeState(newState) {
    gameState = newState;
    if (gameState === 'playing') {
        const char = characters[selectedCharacterIndex];
        const size = 48; // Tamanho padrão para personagens de imagem
        bird = { x: 80, y: 350, width: size, height: size, velocityY: 0, rotation: 0 };
        pipes = []; score = 0; frameCount = 0;
        generateObstacle();
    }
}
function resetGame() { changeState('menu'); }

// --- FUNÇÃO DE INPUT (CLIQUE) ---
function handleInput(event) {
    const rect = canvas.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    if (gameState === 'menu') {
        if (isClickInsideRect({x: clickX, y: clickY}, menuButtons.play)) changeState('charSelect');
    } else if (gameState === 'charSelect') {
        charSelectButtons.chars.forEach((charButton, index) => {
            if (isClickInsideRect({x: clickX, y: clickY}, charButton)) selectedCharacterIndex = index;
        });
        if (isClickInsideRect({x: clickX, y: clickY}, charSelectButtons.play)) changeState('playing');
    } else if (gameState === 'playing') {
        bird.velocityY = jumpStrength;
        createFlapParticles();
    } else if (gameState === 'gameOver') {
        resetGame();
    }
}
function isClickInsideRect(click, rect) { return rect && click.x > rect.x && click.x < rect.x + rect.w && click.y > rect.y && click.y < rect.y + rect.h; }

// --- FUNÇÕES DE UPDATE ---
function update() {
    if (gameState !== 'playing') return;
    bird.velocityY += gravity; bird.y += bird.velocityY;
    if(bird.velocityY < 0) bird.rotation = -0.35; else { bird.rotation += 0.04; if(bird.rotation > 1.2) bird.rotation = 1.2; }
    if (bird.y > canvas.height || bird.y + bird.height < 0) { screenShake(); if (score > highScore) { highScore = score; localStorage.setItem('flappyBoloHighScore', highScore); } changeState('gameOver'); }
    frameCount++;
    if(frameCount % pipeInterval === 0) generateObstacle();
    pipes.forEach(p => { p.x -= pipeSpeed; if (bird.x < p.x + pipeWidth && bird.x + bird.width > p.x && (bird.y < p.y || bird.y + bird.height > p.y + p.gap)) { screenShake(); if (score > highScore) { highScore = score; localStorage.setItem('flappyBoloHighScore', highScore); } changeState('gameOver'); } if(p.x + pipeWidth < bird.x && !p.passed){ score++; p.passed = true; } });
    pipes = pipes.filter(p => p.x + pipeWidth > 0);
    clouds.forEach(c => c.x -= pipeSpeed/4); if(frameCount % 200 === 0) generateCloud(); clouds = clouds.filter(c => c.x + 100 > 0);
    cityscape.forEach(b => b.x -= pipeSpeed/5); cityscape = cityscape.filter(b => b.x + b.width > 0);
    mountains.forEach(m => m.x -= m.speed); mountains = mountains.filter(m => m.x + m.width > 0);
    particles.forEach(p => { p.x += p.vx; p.y += p.vy; p.life--; }); particles = particles.filter(p => p.life > 0);
}

// --- FUNÇÕES DE DESENHO (DRAW) ---
function drawMenu() {
    drawBackground();
    ctx.textAlign = 'center'; ctx.fillStyle = 'white'; ctx.strokeStyle = 'black'; ctx.lineWidth = 8;
    ctx.font = 'bold 70px Arial';
    ctx.strokeText('Flappy Bolo', canvas.width / 2, 200); ctx.fillText('Flappy Bolo', canvas.width / 2, 200);
    const btnW = 220, btnH = 70, btnX = canvas.width/2 - btnW/2, btnY = 350;
    menuButtons.play = { x: btnX, y: btnY, w: btnW, h: btnH };
    ctx.fillStyle = '#73BF29'; ctx.fillRect(btnX, btnY, btnW, btnH);
    ctx.fillStyle = 'white'; ctx.font = 'bold 40px Arial';
    ctx.strokeText('Jogar', canvas.width/2, btnY + 50); ctx.fillText('Jogar', canvas.width/2, btnY + 50);
    ctx.font = '24px Arial';
    if(highScore > 0) ctx.fillText(`Melhor Pontuação: ${highScore}`, canvas.width / 2, 500);
}

function drawCharSelect() {
    drawBackground();
    ctx.textAlign = 'center'; ctx.fillStyle = 'white'; ctx.strokeStyle = 'black'; ctx.lineWidth = 6;
    ctx.font = 'bold 32px Arial';
    ctx.strokeText('Escolha seu Personagem', canvas.width / 2, 160);
    ctx.fillText('Escolha seu Personagem', canvas.width / 2, 160);
    const spacing = 110, startX = canvas.width / 2 - spacing, charY = 320, radius = 45;
    charSelectButtons.chars = [];
    characters.forEach((char, index) => {
        const charX = startX + index * spacing;
        charSelectButtons.chars.push({ x: charX - radius, y: charY - radius, w: radius*2, h: radius*2 });
        if (char.image && char.image.complete && char.image.naturalHeight !== 0) {
            ctx.drawImage(char.image, charX - radius, charY - radius, radius * 2, radius * 2);
        } else {
            ctx.beginPath(); ctx.arc(charX, charY, radius, 0, Math.PI * 2); ctx.fillStyle = char.color || '#333'; ctx.fill();
        }
        if (index === selectedCharacterIndex) {
            ctx.strokeStyle = 'yellow'; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(charX, charY, radius + 4, 0, Math.PI * 2); ctx.stroke();
        }
    });
    const btnW = 220, btnH = 70, btnX = canvas.width/2 - btnW/2, btnY = 520;
    charSelectButtons.play = { x: btnX, y: btnY, w: btnW, h: btnH };
    ctx.fillStyle = '#73BF29'; ctx.fillRect(btnX, btnY, btnW, btnH);
    ctx.fillStyle = 'white'; ctx.font = 'bold 40px Arial'; ctx.strokeStyle = 'black'; ctx.lineWidth = 8;
    ctx.strokeText('Jogar', canvas.width/2, btnY + 50); ctx.fillText('Jogar', canvas.width/2, btnY + 50);
}

function drawGame() {
    drawBackground();
    drawObstacles();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    particles.forEach(p => { ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2); ctx.fill(); });
    ctx.save();
    ctx.translate(bird.x + bird.width / 2, bird.y + bird.height / 2);
    ctx.rotate(bird.rotation);
    const char = characters[selectedCharacterIndex];
    if (char.image && char.image.complete && char.image.naturalHeight !== 0) {
        ctx.drawImage(char.image, -bird.width / 2, -bird.height / 2, bird.width, bird.height);
    } else {
        ctx.beginPath(); ctx.arc(0, 0, bird.width/2, 0, Math.PI*2); ctx.fillStyle = char.color || '#333'; ctx.fill();
    }
    ctx.restore();
    ctx.fillStyle = 'white'; ctx.strokeStyle = 'black'; ctx.lineWidth = 5; ctx.textAlign = 'center';
    ctx.font = `bold 50px Arial`;
    ctx.strokeText(score, canvas.width/2, 80); ctx.fillText(score, canvas.width/2, 80);
}

function drawGameOver() {
    drawGame();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white'; ctx.strokeStyle = 'black'; ctx.lineWidth = 5; ctx.textAlign = 'center';
    ctx.font = `bold 36px Arial`;
    ctx.strokeText('Game Over', canvas.width/2, canvas.height/2 - 60); ctx.fillText('Game Over', canvas.width/2, canvas.height/2 - 60);
    ctx.font = `bold 28px Arial`;
    ctx.strokeText(`Pontos: ${score}`, canvas.width/2, canvas.height/2 - 10); ctx.fillText(`Pontos: ${score}`, canvas.width/2, canvas.height/2 - 10);
    ctx.strokeText(`Melhor: ${highScore}`, canvas.width/2, canvas.height/2 + 30); ctx.fillText(`Melhor: ${highScore}`, canvas.width/2, canvas.height/2 + 30);
}

function draw() {
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
    mountains.forEach(m => {
        ctx.fillStyle = m.color; ctx.beginPath(); ctx.moveTo(m.x, canvas.height);
        m.peaks.forEach(p => { ctx.lineTo(p.x, p.y); });
        ctx.lineTo(m.x + m.width, canvas.height); ctx.closePath(); ctx.fill();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        m.peaks.forEach(p => { if (p.snow > 0) { ctx.beginPath(); ctx.moveTo(p.x - p.snow, p.y + p.snow * 0.5); ctx.lineTo(p.x, p.y); ctx.lineTo(p.x + p.snow, p.y + p.snow * 0.5); ctx.closePath(); ctx.fill(); } });
    });
    ctx.fillStyle = '#1e3040'; cityscape.forEach(b => ctx.fillRect(b.x, b.y, b.width, b.height));
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    clouds.forEach(cloud => { cloud.circles.forEach(circle => { ctx.beginPath(); ctx.arc(cloud.x + circle.offsetX, cloud.y + circle.offsetY, circle.radius, 0, Math.PI * 2); ctx.fill(); }); });
}

function drawObstacles() {
    const obstacleType = characters[selectedCharacterIndex].obstacleType;
    if (obstacleType === 'pipes') {
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
    } else if (obstacleType === 'buildings') {
        pipes.forEach(p => {
            const bldgGradient = ctx.createLinearGradient(p.x, 0, p.x + pipeWidth, 0);
            bldgGradient.addColorStop(0, '#34495E'); bldgGradient.addColorStop(0.5, '#5D6D7E'); bldgGradient.addColorStop(1, '#34495E');
            ctx.fillStyle = bldgGradient;
            const topBuildingHeight = p.y; const bottomBuildingY = p.y + p.gap;
            ctx.fillRect(p.x, 0, pipeWidth, topBuildingHeight);
            ctx.fillRect(p.x, bottomBuildingY, pipeWidth, canvas.height - bottomBuildingY);
            ctx.fillStyle = '#F1C40F';
            p.windows.forEach(w => {
                if (w.y < topBuildingHeight - 5) { ctx.fillRect(p.x + w.x, w.y, w.w, w.h); } 
                else if (w.y > bottomBuildingY + 5) { ctx.fillRect(p.x + w.x, w.y, w.w, w.h); }
            });
        });
    }
}

// --- LOOP PRINCIPAL E EVENTOS ---
function gameLoop() { update(); draw(); requestAnimationFrame(gameLoop); }

const style = document.createElement('style');
style.innerHTML = `@keyframes shake { 10%, 90% { transform: translate3d(-1px, 0, 0); } 20%, 80% { transform: translate3d(2px, 0, 0); } 30%, 50%, 70% { transform: translate3d(-4px, 0, 0); } 40%, 60% { transform: translate3d(4px, 0, 0); }}`;
document.head.appendChild(style);
canvas.addEventListener('click', handleInput);
resetGame();
gameLoop();

// --- FUNÇÕES DE GERAÇÃO ---
function generateObstacle() {
    const obstacleType = characters[selectedCharacterIndex].obstacleType;
    const newPipeGap = Math.random()*(MAX_PIPE_GAP-MIN_PIPE_GAP)+MIN_PIPE_GAP;
    const minHeight=60; const maxHeight=canvas.height-newPipeGap-100;
    let pipeY=Math.floor(Math.random()*(maxHeight-minHeight+1))+minHeight;
    let newObstacle = {x:canvas.width, y:pipeY, gap:newPipeGap, passed:false};
    if (obstacleType === 'buildings') {
        newObstacle.windows = [];
        for (let wx = 10; wx < pipeWidth - 10; wx += 15) {
            for (let wy = 10; wy < canvas.height - 10; wy += 20) {
                if (Math.random() > 0.4) {
                    newObstacle.windows.push({ x: wx, y: wy, w: 5, h: 8 });
                }
            }
        }
    }
    pipes.push(newObstacle);
}
function generateCityscape() { let currentX = -40; while(currentX < canvas.width + 60){ const h = 70 + Math.random() * 100; const w = 30 + Math.random() * 40; cityscape.push({x:currentX, y:canvas.height-h, width:w, height:h}); currentX += w + 3; } }
function createFlapParticles() { for(let i=0; i<5; i++){ particles.push({ x: bird.x + bird.width/2, y: bird.y + bird.height/2, radius: Math.random()*2+1, vx: (Math.random()-0.5)*1.5, vy: Math.random()*1.5+0.5, life: 30 }); } }
function screenShake() { document.body.style.animation = 'shake 0.2s'; setTimeout(()=>document.body.style.animation = '', 200); }
function generateCloud() { const y=Math.random()*(canvas.height*0.5); const numCircles=3+Math.floor(Math.random()*4); const baseRadius=20+Math.random()*15; const circles=[]; for(let i=0;i<numCircles;i++){circles.push({offsetX:(i*baseRadius*1.1)-(numCircles*baseRadius*0.55),offsetY:(Math.random()-0.5)*baseRadius*0.6,radius:baseRadius*(0.8+Math.random()*0.4)}); } clouds.push({x:canvas.width+100,y,circles}); }
function generateInitialClouds() { for(let i=0;i<4;i++){const x=Math.random()*canvas.width; generateCloud(); clouds[clouds.length-1].x=x;} }
function generateMountains() {
    mountains = []; // Limpa as montanhas antigas
    let layers = [{color:'#1B2631', speed:pipeSpeed/8, height: 200, width:180}, {color:'#283747', speed:pipeSpeed/6, height:150, width:200}];
    layers.forEach(layer => {
        let currentX = -100;
        while (currentX < canvas.width + 100) {
            const w = layer.width + Math.random() * 150;
            const h = layer.height + Math.random() * 80;
            const y = canvas.height - h;
            const peaks = [];
            const peakCount = 2 + Math.floor(Math.random()*3);
            for(let i=0; i<peakCount; i++){
                const peakH = y - Math.random()*40;
                const snowAmount = peakH < 120 ? 10 + Math.random()*5 : 0;
                peaks.push({x: currentX + (w/peakCount)*i + Math.random()*20, y: peakH, snow: snowAmount});
            }
            mountains.push({x: currentX, y, width: w, color: layer.color, speed: layer.speed, peaks: peaks});
            currentX += w * (0.6 + Math.random() * 0.2);
        }
    });
    mountains.sort((a,b) => a.y - b.y);
}
(function (){ generateMountains(); })();