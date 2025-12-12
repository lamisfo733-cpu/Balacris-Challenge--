// ===== MARIO GAME =====
let canvas, ctx;
let player, platforms, obstacles, coins, door;
let gameRunning = false;
let lives = 3;
let collectedCoins = 0;
let doorUnlocked = false;
let codeFixed = false;
let gameScore = 0;

function initMarioGame() {
    lives = 3;
    collectedCoins = 0;
    doorUnlocked = false;
    codeFixed = false;
    gameScore = 0;
    gameRunning = false;
    
    document.getElementById('lives').textContent = lives;
    document.getElementById('code1').value = '';
    document.getElementById('code2').value = '';
    document.getElementById('code3').value = '';
    document.getElementById('doorCode1').value = '';
    document.getElementById('doorCode2').value = '';
    
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    
    // Hide door challenge initially
    document.getElementById('doorChallenge').classList.add('hidden');
}

function checkStartCode() {
    const code1 = document.getElementById('code1').value;
    const code2 = document.getElementById('code2').value;
    const code3 = document.getElementById('code3').value;
    
    // Correct answers: 5, 15, 0.8
    if (code1 === '5' && code2 === '15' && code3 === '0.8') {
        showNotification('✓ الكود صحيح! يمكنك البدء باللعبة', 'success');
        codeFixed = true;
        startMarioGame();
    } else {
        showNotification('✗ الكود غير صحيح. حاول مرة أخرى!', 'error');
    }
}

function startMarioGame() {
    if (!codeFixed) return;
    
    gameRunning = true;
    
    // Initialize player
    player = {
        x: 50,
        y: 300,
        width: 40,
        height: 40,
        velocityY: 0,
        velocityX: 0,
        speed: 5,
        jumpPower: 15,
        gravity: 0.8,
        isJumping: false,
        color: '#00ff88'
    };
    
    // Initialize platforms
    platforms = [
        { x: 0, y: 370, width: 800, height: 30, color: '#8b4513' },
        { x: 150, y: 280, width: 100, height: 20, color: '#8b4513' },
        { x: 300, y: 220, width: 120, height: 20, color: '#8b4513' },
        { x: 500, y: 180, width: 100, height: 20, color: '#8b4513' },
        { x: 650, y: 250, width: 150, height: 20, color: '#8b4513' }
    ];
    
    // Initialize obstacles
    obstacles = [
        { x: 200, y: 340, width: 30, height: 30, color: '#ff6b35' },
        { x: 350, y: 190, width: 30, height: 30, color: '#ff6b35' },
        { x: 550, y: 150, width: 30, height: 30, color: '#ff6b35' }
    ];
    
    // Initialize coins
    coins = [
        { x: 180, y: 250, width: 20, height: 20, collected: false },
        { x: 350, y: 190, width: 20, height: 20, collected: false },
        { x: 550, y: 150, width: 20, height: 20, collected: false },
        { x: 700, y: 220, width: 20, height: 20, collected: false }
    ];
    
    // Initialize door (hidden until unlocked)
    door = {
        x: 720,
        y: 200,
        width: 50,
        height: 70,
        visible: false,
        color: '#FFD700'
    };
    
    // Setup keyboard controls
    setupControls();
    
    // Start game loop
    gameLoop();
}

function setupControls() {
    document.addEventListener('keydown', (e) => {
        if (!gameRunning) return;
        
        switch(e.key) {
            case 'ArrowRight':
                player.velocityX = player.speed;
                break;
            case 'ArrowLeft':
                player.velocityX = -player.speed;
                break;
            case 'ArrowUp':
            case ' ':
                if (!player.isJumping) {
                    player.velocityY = -player.jumpPower;
                    player.isJumping = true;
                }
                e.preventDefault();
                break;
        }
    });
    
    document.addEventListener('keyup', (e) => {
        if (!gameRunning) return;
        
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
            player.velocityX = 0;
        }
    });
}

function gameLoop() {
    if (!gameRunning) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw sky
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#87ceeb');
    gradient.addColorStop(0.7, '#87ceeb');
    gradient.addColorStop(1, '#8b4513');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Update player physics
    player.velocityY += player.gravity;
    player.y += player.velocityY;
    player.x += player.velocityX;
    
    // Boundary checks
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
    
    // Platform collision
    player.isJumping = true;
    platforms.forEach(platform => {
        if (checkCollision(player, platform) && player.velocityY > 0) {
            player.y = platform.y - player.height;
            player.velocityY = 0;
            player.isJumping = false;
        }
    });
    
    // Obstacle collision
    obstacles.forEach(obstacle => {
        if (checkCollision(player, obstacle)) {
            loseLife();
        }
    });
    
    // Coin collection
    coins.forEach(coin => {
        if (!coin.collected && checkCollision(player, coin)) {
            coin.collected = true;
            collectedCoins++;
            gameScore += 10;
            showNotification('عملة! +10 نقاط', 'success');
            
            // Check if all coins collected
            if (collectedCoins === coins.length) {
                showDoorChallenge();
            }
        }
    });
    
    // Door collision (win condition)
    if (door.visible && checkCollision(player, door)) {
        completeMarioGame();
        return;
    }
    
    // Fall off map
    if (player.y > canvas.height) {
        loseLife();
    }
    
    // Draw everything
    drawPlatforms();
    drawObstacles();
    drawCoins();
    if (door.visible) drawDoor();
    drawPlayer();
    
    // Continue game loop
    requestAnimationFrame(gameLoop);
}

function drawPlayer() {
    // Draw robot character
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
    
    // Robot head
    ctx.fillStyle = '#00ff88';
    ctx.fillRect(player.x + 8, player.y + 2, 24, 20);
    
    // Eyes
    ctx.fillStyle = '#000';
    ctx.fillRect(player.x + 12, player.y + 8, 6, 6);
    ctx.fillRect(player.x + 22, player.y + 8, 6, 6);
    
    // Antenna
    ctx.strokeStyle = '#00ff88';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(player.x + 20, player.y + 2);
    ctx.lineTo(player.x + 20, player.y - 5);
    ctx.stroke();
    ctx.fillStyle = '#ff6b35';
    ctx.beginPath();
    ctx.arc(player.x + 20, player.y - 5, 3, 0, Math.PI * 2);
    ctx.fill();
}

function drawPlatforms() {
    platforms.forEach(platform => {
        ctx.fillStyle = platform.color;
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
        
        // Add texture
        ctx.strokeStyle = '#654321';
        ctx.lineWidth = 2;
        for (let i = 0; i < platform.width; i += 20) {
            ctx.beginPath();
            ctx.moveTo(platform.x + i, platform.y);
            ctx.lineTo(platform.x + i, platform.y + platform.height);
            ctx.stroke();
        }
    });
}

function drawObstacles() {
    obstacles.forEach(obstacle => {
        ctx.fillStyle = obstacle.color;
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        
        // Draw spikes
        ctx.fillStyle = '#ff0000';
        for (let i = 0; i < obstacle.width; i += 10) {
            ctx.beginPath();
            ctx.moveTo(obstacle.x + i, obstacle.y + obstacle.height);
            ctx.lineTo(obstacle.x + i + 5, obstacle.y);
            ctx.lineTo(obstacle.x + i + 10, obstacle.y + obstacle.height);
            ctx.fill();
        }
    });
}

function drawCoins() {
    coins.forEach(coin => {
        if (!coin.collected) {
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.arc(coin.x + coin.width/2, coin.y + coin.height/2, coin.width/2, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.strokeStyle = '#FFA500';
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    });
}

function drawDoor() {
    // Door frame
    ctx.fillStyle = door.color;
    ctx.fillRect(door.x, door.y, door.width, door.height);
    
    // Door detail
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3;
    ctx.strokeRect(door.x, door.y, door.width, door.height);
    
    // Door handle
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(door.x + door.width - 10, door.y + door.height/2, 4, 0, Math.PI * 2);
    ctx.fill();
    
    // Glow effect
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#FFD700';
    ctx.strokeRect(door.x, door.y, door.width, door.height);
    ctx.shadowBlur = 0;
}

function checkCollision(obj1, obj2) {
    return obj1.x < obj2.x + obj2.width &&
           obj1.x + obj1.width > obj2.x &&
           obj1.y < obj2.y + obj2.height &&
           obj1.y + obj1.height > obj2.y;
}

function loseLife() {
    lives--;
    document.getElementById('lives').textContent = lives;
    
    if (lives <= 0) {
        gameOver();
    } else {
        // Reset player position
        player.x = 50;
        player.y = 300;
        player.velocityX = 0;
        player.velocityY = 0;
        showNotification('فقدت حياة! ' + lives + ' متبقية', 'error');
    }
}

function showDoorChallenge() {
    gameRunning = false;
    document.getElementById('doorChallenge').classList.remove('hidden');
    showNotification('جمعت كل العملات! الآن أصلح الكود لإظهار الباب', 'success');
}

function checkDoorCode() {
    const code1 = document.getElementById('doorCode1').value.toUpperCase();
    const code2 = document.getElementById('doorCode2').value.toUpperCase();
    
    // Correct answer: BLAXX, ROBOT
    if (code1 === 'BLAXX' && code2 === 'ROBOT') {
        showNotification('✓ الكود صحيح! الباب يفتح الآن!', 'success');
        door.visible = true;
        doorUnlocked = true;
        document.getElementById('doorChallenge').classList.add('hidden');
        gameRunning = true;
        gameLoop();
    } else {
        showNotification('✗ الكود غير صحيح. حاول مرة أخرى!', 'error');
    }
}

function gameOver() {
    gameRunning = false;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#ff6b35';
    ctx.font = '48px Cairo';
    ctx.textAlign = 'center';
    ctx.fillText('انتهت اللعبة!', canvas.width/2, canvas.height/2 - 30);
    
    ctx.fillStyle = '#fff';
    ctx.font = '24px Cairo';
    ctx.fillText('اضغط F5 لإعادة المحاولة', canvas.width/2, canvas.height/2 + 30);
}

async function completeMarioGame() {
    gameRunning = false;
    
    // Calculate score
    const finalScore = gameScore + (lives * 20) + 50; // Bonus for completion
    gameState.stageScores[3] = finalScore;
    gameState.totalScore += finalScore;
    
    if (!gameState.completedStages.includes(3)) {
        gameState.completedStages.push(3);
    }
    
    // Add clue
    if (!gameState.treasureClues.includes('المرحلة 3: CODE')) {
        gameState.treasureClues.push('المرحلة 3: CODE');
    }
    
    await saveProgress();
    
    // Show completion screen
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#00ff88';
    ctx.font = '48px Cairo';
    ctx.textAlign = 'center';
    ctx.fillText('مبروك! 🎉', canvas.width/2, canvas.height/2 - 60);
    
    ctx.fillStyle = '#fff';
    ctx.font = '24px Cairo';
    ctx.fillText('أكملت المرحلة 3', canvas.width/2, canvas.height/2 - 10);
    ctx.fillText(`النقاط: ${finalScore}`, canvas.width/2, canvas.height/2 + 30);
    
    setTimeout(() => {
        backToStages();
    }, 3000);
}
