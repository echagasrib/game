// game.js - VERSÃO SEM DICIONÁRIO (ACEITA QUALQUER PALAVRA)

document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENTOS DO DOM ---
    const gridContainer = document.getElementById('grid-container');
    const keyboardContainer = document.getElementById('keyboard-container');
    const notificationContainer = document.getElementById('notification-container');

    // --- CONFIGURAÇÕES DO JOGO ---
    // ATUALIZADO: Usando uma única palavra secreta para teste, sem depender de listas.
    const palavraSecreta = "PENIS"; 
    
    const NUMERO_DE_TENTATIVAS = 6;
    const TAMANHO_DA_PALAVRA = 5;

    // --- ESTADO DO JOGO ---
    let tentativaAtual = 0;
    let letraAtual = 0;
    let isGameOver = false;

    // --- FUNÇÕES DE FEEDBACK (sem alterações) ---
    function showNotification(message, duration = 2000) {
        const notification = document.createElement('div');
        notification.classList.add('notification');
        notification.textContent = message;
        notificationContainer.appendChild(notification);
        setTimeout(() => { notification.remove(); }, duration);
    }
    
    function showStats() {
        // ... (código das estatísticas e compartilhamento permanece o mesmo)
        const stats = JSON.parse(localStorage.getItem('palavrasSecretasStats')) || { wins: 0, games: 0, streak: 0, maxStreak: 0 };
        const shareText = generateShareText();
        const panel = document.createElement('div');
        panel.classList.add('stats-panel');
        panel.innerHTML = `<h2>Estatísticas</h2><div class="stats-grid"><div class="stat"><span class="number">${stats.games}</span><span class="label">Jogos</span></div><div class="stat"><span class="number">${Math.round((stats.wins/stats.games || 0)*100)}%</span><span class="label">Vitórias</span></div><div class="stat"><span class="number">${stats.streak}</span><span class="label">Sequência</span></div><div class="stat"><span class="number">${stats.maxStreak}</span><span class="label">Melhor Seq.</span></div></div><p>A palavra era: <strong>${palavraSecreta}</strong></p><button class="share-button">Copiar Resultado 📋</button>`;
        notificationContainer.appendChild(panel);
        panel.querySelector('.share-button').addEventListener('click', () => {
            navigator.clipboard.writeText(shareText).then(() => {
                showNotification("Resultado copiado!");
            }).catch(err => {
                showNotification("Erro ao copiar.");
            });
        });
    }
    
    function generateShareText() {
        let text = `Palavras Secretas ${isGameOver && getCurrentGuess() === palavraSecreta ? tentativaAtual + 1 : 'X'}/${NUMERO_DE_TENTATIVAS}\n\n`;
        for (let i = 0; i <= tentativaAtual; i++) {
            for (let j = 0; j < TAMANHO_DA_PALAVRA; j++) {
                const tile = document.getElementById(`tile-${i}-${j}`);
                if (tile.classList.contains('correct')) text += '🟩';
                else if (tile.classList.contains('present')) text += '🟨';
                else text += '⬛';
            }
            text += '\n';
        }
        return text;
    }
    
    function updateStats(won) {
        let stats = JSON.parse(localStorage.getItem('palavrasSecretasStats')) || { wins: 0, games: 0, streak: 0, maxStreak: 0 };
        stats.games++;
        if (won) {
            stats.wins++;
            stats.streak++;
            if (stats.streak > stats.maxStreak) stats.maxStreak = stats.streak;
        } else {
            stats.streak = 0;
        }
        localStorage.setItem('palavrasSecretasStats', JSON.stringify(stats));
    }

    // --- LÓGICA PRINCIPAL DO JOGO ---
    function submitGuess() {
        const guess = getCurrentGuess();
        
        // ATUALIZADO: A verificação de dicionário foi completamente removida.
        
        const check = checkGuess(guess);
        animateAndColorRow(check);
    }
    
    // O resto do código permanece igual à versão funcional anterior
    function checkWinLoss(check) { const won = check.every(val => val === 'correct'); const lost = !won && tentativaAtual === NUMERO_DE_TENTATIVAS - 1; if (won || lost) { isGameOver = true; updateStats(won); setTimeout(showStats, TAMANHO_DA_PALAVRA * 300 + 200); } else { tentativaAtual++; letraAtual = 0; } }
    function handleKeyPress(key) { if (isGameOver) return; if (key === 'ENTER') { if (letraAtual === TAMANHO_DA_PALAVRA) submitGuess(); else showNotification("Faltam letras!"); } else if (key === '«') { deleteLetter(); } else if (letraAtual < TAMANHO_DA_PALAVRA) { addLetter(key); } }
    function addLetter(key) { const tile = document.getElementById(`tile-${tentativaAtual}-${letraAtual}`); tile.textContent = key; tile.classList.add('filled'); letraAtual++; }
    function deleteLetter() { if (letraAtual > 0) { letraAtual--; const tile = document.getElementById(`tile-${tentativaAtual}-${letraAtual}`); tile.textContent = ''; tile.classList.remove('filled'); } }
    function getCurrentGuess() { let word = ''; for (let i = 0; i < TAMANHO_DA_PALAVRA; i++) { const tile = document.getElementById(`tile-${tentativaAtual}-${i}`); word += tile.textContent; } return word; }
    function checkGuess(guess) { const result = []; const palavraArray = palavraSecreta.split(''); const guessArray = guess.split(''); const checked = Array(TAMANHO_DA_PALAVRA).fill(false); for (let i = 0; i < TAMANHO_DA_PALAVRA; i++) { if (guessArray[i] === palavraArray[i]) { result[i] = 'correct'; checked[i] = true; palavraArray[i] = null; } } for (let i = 0; i < TAMANHO_DA_PALAVRA; i++) { if (!checked[i]) { const letterIndex = palavraArray.indexOf(guessArray[i]); if (letterIndex > -1) { result[i] = 'present'; palavraArray[letterIndex] = null; } else { result[i] = 'absent'; } } } return result; }
    function animateAndColorRow(check) { const rowTiles = document.querySelectorAll(`#grid-container > div:nth-child(-n+${(tentativaAtual+1)*5}):nth-child(n+${tentativaAtual*5+1})`); rowTiles.forEach((tile, index) => { setTimeout(() => { tile.classList.add('flip'); setTimeout(() => { tile.classList.add(check[index]); updateKeyboardColor(tile.textContent, check[index]); }, 250); }, index * 300); }); setTimeout(() => checkWinLoss(check), TAMANHO_DA_PALAVRA * 300); }
    function updateKeyboardColor(letter, status) { const key = document.querySelector(`.key[data-key="${letter}"]`); if (!key.classList.contains('correct')) { if (!key.classList.contains('present') || status === 'correct') { key.classList.add(status); } } }
    function createGrid() { for (let i = 0; i < NUMERO_DE_TENTATIVAS * TAMANHO_DA_PALAVRA; i++) { const tile = document.createElement('div'); tile.classList.add('tile'); tile.setAttribute('id', `tile-${Math.floor(i / TAMANHO_DA_PALAVRA)}-${i % TAMANHO_DA_PALAVRA}`); gridContainer.appendChild(tile); } }
    function createKeyboard() { const keys = [ 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', '«' ]; const rows = [keys.slice(0, 10), keys.slice(10, 19), keys.slice(19)]; rows.forEach(rowKeys => { const rowDiv = document.createElement('div'); rowDiv.classList.add('keyboard-row'); rowKeys.forEach(key => { const keyButton = document.createElement('button'); keyButton.classList.add('key'); keyButton.textContent = key; keyButton.setAttribute('data-key', key); if (key === 'ENTER' || key === '«') { keyButton.classList.add('large'); } rowDiv.appendChild(keyButton); }); keyboardContainer.appendChild(rowDiv); }); }
    
    // --- INICIALIZAÇÃO ---
    createGrid();
    createKeyboard();
    keyboardContainer.addEventListener('click', (e) => { if (e.target.classList.contains('key')) handleKeyPress(e.target.getAttribute('data-key')); });
    document.addEventListener('keydown', (e) => { const key = e.key.toUpperCase(); if (key === 'ENTER' || key === 'BACKSPACE') handleKeyPress(key === 'BACKSPACE' ? '«' : 'ENTER'); else if (key.length === 1 && key >= 'A' && key <= 'Z') handleKeyPress(key); });
});