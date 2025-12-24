const menuElement = document.getElementById('game-menu');
const gameArea = document.getElementById('game-area');
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const backBtn = document.getElementById('back-btn');
const scoreElement = document.getElementById('score');

let activeGameInterval = null; // Oyun döngüsünü durdurmak için
let currentGame = null;

// --- 1. SİSTEM BAŞLANGICI ---
async function init() {
    try {
        const response = await fetch('games.json');
        const games = await response.json();
        renderMenu(games);
    } catch (error) {
        console.error("Oyun listesi yüklenemedi:", error);
        // Fallback (JSON yüklenemezse manuel ekle)
        renderMenu([
            {id: 'snake', title: 'Yılan Oyunu', icon: '🐍'},
            {id: 'memory', title: 'Hafıza Oyunu', icon: '🧠'},
            {id: 'race', title: 'Araba Yarışı', icon: '🏎️'}
        ]);
    }
}

function renderMenu(games) {
    menuElement.innerHTML = '';
    games.forEach(game => {
        const card = document.createElement('div');
        card.className = 'game-card';
        card.innerHTML = `<span class="game-icon">${game.icon}</span><h3>${game.title}</h3>`;
        card.onclick = () => loadGame(game.id);
        menuElement.appendChild(card);
    });
}

function loadGame(gameId) {
    menuElement.classList.add('hidden');
    gameArea.classList.remove('hidden');
    backBtn.classList.remove('hidden');
    scoreElement.innerText = '0';
    currentGame = gameId;

    if (gameId === 'snake') startSnakeGame();
    else if (gameId === 'memory') alert('Hafıza oyunu yakında eklenecek!'); // Burayı sonra dolduracağız
    else if (gameId === 'race') alert('Araba yarışı yakında eklenecek!');   // Burayı sonra dolduracağız
}

backBtn.onclick = () => {
    clearInterval(activeGameInterval); // Aktif oyunu durdur
    gameArea.classList.add('hidden');
    backBtn.classList.add('hidden');
    menuElement.classList.remove('hidden');
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Ekranı temizle
    
    // Event listener'ları temizlemek için klonlama (basit yöntem)
    const newCanvas = canvas.cloneNode(true);
    canvas.parentNode.replaceChild(newCanvas, canvas);
    // Değişkenleri güncellememiz gerekir çünkü canvas DOM elemanı değişti
    window.location.reload(); // En temiz sıfırlama için sayfayı yenilemek basittir
};

// --- 2. YILAN OYUNU MANTIĞI ---
function startSnakeGame() {
    const gridSize = 20;
    const tileCount = canvas.width / gridSize;
    let score = 0;
    
    let player = { x: 10, y: 10 };
    let food = { x: 15, y: 15 };
    let velocity = { x: 0, y: 0 };
    let trail = [];
    let tail = 5;

    function gameLoop() {
        player.x += velocity.x;
        player.y += velocity.y;

        // Duvarlardan geçiş (sonsuz döngü)
        if (player.x < 0) player.x = tileCount - 1;
        if (player.x > tileCount - 1) player.x = 0;
        if (player.y < 0) player.y = tileCount - 1;
        if (player.y > tileCount - 1) player.y = 0;

        // Arka planı boya
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Yılanı boya
        ctx.fillStyle = "lime";
        for (let i = 0; i < trail.length; i++) {
            ctx.fillRect(trail[i].x * gridSize, trail[i].y * gridSize, gridSize - 2, gridSize - 2);
            
            // Kendine çarpma kontrolü
            if (trail[i].x === player.x && trail[i].y === player.y && (velocity.x !== 0 || velocity.y !== 0)) {
                tail = 5;
                score = 0;
                scoreElement.innerText = score;
                // Oyunu sıfırla ama devam et
            }
        }

        trail.push({ x: player.x, y: player.y });
        while (trail.length > tail) {
            trail.shift();
        }

        // Yemi boya
        ctx.fillStyle = "red";
        ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize - 2, gridSize - 2);

        // Yemi yeme kontrolü
        if (player.x === food.x && player.y === food.y) {
            tail++;
            score += 10;
            scoreElement.innerText = score;
            food.x = Math.floor(Math.random() * tileCount);
            food.y = Math.floor(Math.random() * tileCount);
        }
    }

    function keyPush(evt) {
        switch (evt.keyCode) {
            case 37: // Sol
                if(velocity.x === 1) break; // Geri gidemez
                velocity = { x: -1, y: 0 }; break;
            case 38: // Yukarı
                if(velocity.y === 1) break;
                velocity = { x: 0, y: -1 }; break;
            case 39: // Sağ
                if(velocity.x === -1) break;
                velocity = { x: 1, y: 0 }; break;
            case 40: // Aşağı
                if(velocity.y === -1) break;
                velocity = { x: 0, y: 1 }; break;
        }
    }

    document.addEventListener("keydown", keyPush);
    activeGameInterval = setInterval(gameLoop, 1000 / 10); // 10 FPS
}

// Başlat
init();
