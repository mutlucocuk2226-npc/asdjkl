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
    else if (gameId === 'memory') alert('Hafıza oyunu yakında eklenecek!');
    else if (gameId === 'race') startRaceGame(); // <-- BURAYI GÜNCELLEDİK
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
// --- 3. ARABA YARIŞI OYUNU MANTIĞI ---
function startRaceGame() {
    // Değişkenler
    const carWidth = 40;
    const carHeight = 70;
    let playerX = canvas.width / 2 - carWidth / 2;
    let playerY = canvas.height - 100;
    let obstacles = [];
    let score = 0;
    let speed = 5;
    let roadMarkingY = 0; // Yol çizgilerinin hareketi için

    // Klavye Kontrolleri (Sağ - Sol)
    function handleInput(e) {
        if (e.key === "ArrowLeft" && playerX > 0) {
            playerX -= 20;
        }
        if (e.key === "ArrowRight" && playerX < canvas.width - carWidth) {
            playerX += 20;
        }
    }
    document.addEventListener("keydown", handleInput);

    function gameLoop() {
        // 1. Temizle ve Arka Planı Çiz (Yol)
        ctx.fillStyle = "#333"; // Asfalt rengi
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 2. Yol Çizgilerini Çiz (Hareket Efekti)
        ctx.fillStyle = "#fff";
        roadMarkingY += speed;
        if (roadMarkingY > 40) roadMarkingY = 0;
        
        for (let i = -40; i < canvas.height; i += 40) {
            // Yolun ortasına kesik çizgiler
            ctx.fillRect(canvas.width / 2 - 2, i + roadMarkingY, 4, 20);
        }
        
        // Yol kenar şeritleri
        ctx.fillStyle = score % 20 < 10 ? "#e94560" : "#fff"; // Yanıp sönen kenarlar
        ctx.fillRect(0, 0, 10, canvas.height);
        ctx.fillRect(canvas.width - 10, 0, 10, canvas.height);

        // 3. Oyuncuyu Çiz
        ctx.fillStyle = "#00d2d3"; // Oyuncu araba rengi (Mavi)
        ctx.shadowBlur = 10;
        ctx.shadowColor = "#00d2d3";
        ctx.fillRect(playerX, playerY, carWidth, carHeight);
        ctx.shadowBlur = 0; // Diğer çizimler parlamasın

        // 4. Engelleri Yönet (Oluştur ve Hareket Ettir)
        // Her 40 framede bir yeni engel (hıza göre zorluk artabilir)
        if (Math.random() < 0.03) { 
            let obstacleX = Math.random() * (canvas.width - carWidth - 20) + 10;
            obstacles.push({ x: obstacleX, y: -100, width: carWidth, height: carHeight });
        }

        for (let i = 0; i < obstacles.length; i++) {
            let obs = obstacles[i];
            obs.y += speed; // Engeli aşağı indir
            
            // Engeli Çiz
            ctx.fillStyle = "#ff6b6b"; // Düşman araba rengi (Kırmızı)
            ctx.fillRect(obs.x, obs.y, obs.width, obs.height);

            // Çarpışma Kontrolü
            if (
                playerX < obs.x + obs.width &&
                playerX + carWidth > obs.x &&
                playerY < obs.y + obs.height &&
                playerY + carHeight > obs.y
            ) {
                // Oyun Bitti
                clearInterval(activeGameInterval);
                document.removeEventListener("keydown", handleInput);
                ctx.fillStyle = "white";
                ctx.font = "30px Arial";
                ctx.fillText("OYUN BİTTİ!", canvas.width/2 - 90, canvas.height/2);
                ctx.font = "20px Arial";
                ctx.fillText("Puan: " + score, canvas.width/2 - 40, canvas.height/2 + 40);
                return;
            }

            // Ekrandan çıkan engelleri sil ve puan ver
            if (obs.y > canvas.height) {
                obstacles.splice(i, 1);
                i--;
                score++;
                scoreElement.innerText = score;
                
                // Her 10 puanda bir hızı hafifçe artır
                if(score % 10 === 0) speed += 0.5; 
            }
        }
    }

    // Oyunu Başlat (30 FPS)
    activeGameInterval = setInterval(gameLoop, 1000 / 30);
}

// Başlat
init();
