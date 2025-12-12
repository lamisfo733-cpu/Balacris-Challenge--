// ===== GLOBAL STATE =====
let currentPlayer = null;
let currentStage = 0;
let gameState = {
    teamName: '',
    email: '',
    totalScore: 0,
    completedStages: [],
    stageScores: {},
    treasureClues: [],
    currentStageId: null
};

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    // Check if player is logged in
    const savedPlayer = localStorage.getItem('currentPlayer');
    if (savedPlayer) {
        currentPlayer = JSON.parse(savedPlayer);
        gameState = currentPlayer;
        loadPlayerProgress();
    }
    
    // Setup treasure input auto-focus
    setupTreasureInputs();
});

// ===== AUTHENTICATION =====
async function startGame() {
    const teamName = document.getElementById('teamNameInput').value.trim();
    const email = document.getElementById('emailInput').value.trim();
    
    if (!teamName || !email) {
        alert('الرجاء إدخال اسم الفريق والبريد الإلكتروني');
        return;
    }
    
    // Check if admin
    if (email === 'lamisfo733@gmail.com') {
        showScreen('adminScreen');
        loadAdminData();
        return;
    }
    
    // Check if player exists
    try {
        const response = await fetch(`tables/players?search=${email}`);
        const data = await response.json();
        
        if (data.data && data.data.length > 0) {
            // Load existing player
            currentPlayer = data.data[0];
            gameState = {
                teamName: currentPlayer.teamName,
                email: currentPlayer.email,
                totalScore: currentPlayer.totalScore || 0,
                completedStages: currentPlayer.completedStages || [],
                stageScores: JSON.parse(currentPlayer.stageScores || '{}'),
                treasureClues: currentPlayer.treasureClues || [],
                currentStageId: currentPlayer.id
            };
        } else {
            // Create new player
            const newPlayer = {
                teamName: teamName,
                email: email,
                currentStage: 1,
                totalScore: 0,
                completedStages: [],
                stageScores: JSON.stringify({}),
                treasureClues: [],
                isWinner: false
            };
            
            const createResponse = await fetch('tables/players', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(newPlayer)
            });
            
            currentPlayer = await createResponse.json();
            gameState = {
                teamName: teamName,
                email: email,
                totalScore: 0,
                completedStages: [],
                stageScores: {},
                treasureClues: [],
                currentStageId: currentPlayer.id
            };
        }
        
        localStorage.setItem('currentPlayer', JSON.stringify(gameState));
        showScreen('stageSelectionScreen');
        updatePlayerDisplay();
        updateStageCards();
        
    } catch (error) {
        console.error('Error:', error);
        alert('حدث خطأ. الرجاء المحاولة مرة أخرى.');
    }
}

function logout() {
    if (confirm('هل تريد تسجيل الخروج؟')) {
        localStorage.removeItem('currentPlayer');
        currentPlayer = null;
        gameState = {
            teamName: '',
            email: '',
            totalScore: 0,
            completedStages: [],
            stageScores: {},
            treasureClues: [],
            currentStageId: null
        };
        showScreen('loginScreen');
    }
}

function playAgain() {
    showScreen('stageSelectionScreen');
    updateStageCards();
}

// ===== SCREEN MANAGEMENT =====
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

function backToLogin() {
    showScreen('loginScreen');
}

function backToStages() {
    showScreen('stageSelectionScreen');
    updateStageCards();
}

// ===== PLAYER PROGRESS =====
function updatePlayerDisplay() {
    document.getElementById('teamNameDisplay').textContent = gameState.teamName;
    document.getElementById('totalScoreDisplay').textContent = gameState.totalScore;
}

function updateStageCards() {
    document.querySelectorAll('.stage-card').forEach((card, index) => {
        const stageNum = index + 1;
        const isCompleted = gameState.completedStages.includes(stageNum);
        const score = gameState.stageScores[stageNum] || 0;
        
        // Update score display
        const scoreDisplay = card.querySelector('.stage-score');
        const maxScores = {1: 100, 2: 100, 3: 150, 4: 100, 5: 100, 6: 200, 7: 100, 8: 100, 9: 100, 10: 300};
        scoreDisplay.textContent = `${score}/${maxScores[stageNum]}`;
        
        // Mark as completed
        if (isCompleted) {
            card.classList.add('completed');
            card.querySelector('.btn-stage').textContent = 'مكتملة ✓';
        } else {
            card.classList.remove('completed');
            card.querySelector('.btn-stage').textContent = 'ابدأ';
        }
        
        // Lock stage 10 until all others are completed
        if (stageNum === 10 && gameState.completedStages.length < 9) {
            card.classList.add('locked');
            card.querySelector('.btn-stage').textContent = 'مقفلة 🔒';
            card.querySelector('.btn-stage').disabled = true;
        } else {
            card.classList.remove('locked');
            card.querySelector('.btn-stage').disabled = false;
        }
    });
}

async function saveProgress() {
    if (!gameState.currentStageId) return;
    
    try {
        const updateData = {
            totalScore: gameState.totalScore,
            completedStages: gameState.completedStages,
            stageScores: JSON.stringify(gameState.stageScores),
            treasureClues: gameState.treasureClues,
            currentStage: Math.max(...gameState.completedStages, 1)
        };
        
        await fetch(`tables/players/${gameState.currentStageId}`, {
            method: 'PATCH',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(updateData)
        });
        
        localStorage.setItem('currentPlayer', JSON.stringify(gameState));
    } catch (error) {
        console.error('Error saving progress:', error);
    }
}

async function loadPlayerProgress() {
    if (!currentPlayer || !currentPlayer.id) return;
    
    try {
        const response = await fetch(`tables/players/${currentPlayer.id}`);
        const player = await response.json();
        
        gameState = {
            teamName: player.teamName,
            email: player.email,
            totalScore: player.totalScore || 0,
            completedStages: player.completedStages || [],
            stageScores: JSON.parse(player.stageScores || '{}'),
            treasureClues: player.treasureClues || [],
            currentStageId: player.id
        };
        
        localStorage.setItem('currentPlayer', JSON.stringify(gameState));
        showScreen('stageSelectionScreen');
        updatePlayerDisplay();
        updateStageCards();
    } catch (error) {
        console.error('Error loading progress:', error);
    }
}

// ===== STAGE NAVIGATION =====
function startStage(stageNum) {
    currentStage = stageNum;
    
    // Quiz stages
    if ([1, 2, 4, 5, 7, 8, 9].includes(stageNum)) {
        initQuiz(stageNum);
    }
    // Mario game
    else if (stageNum === 3) {
        showScreen('marioScreen');
        initMarioGame();
    }
    // Lab
    else if (stageNum === 6) {
        showScreen('labScreen');
        initLab();
    }
    // Treasure hunt
    else if (stageNum === 10) {
        showScreen('treasureScreen');
        initTreasureHunt();
    }
}

// ===== LEADERBOARD =====
async function showLeaderboard() {
    showScreen('leaderboardScreen');
    await loadLeaderboard();
}

async function loadLeaderboard() {
    try {
        const response = await fetch('tables/players?sort=-totalScore&limit=100');
        const data = await response.json();
        
        if (data.data && data.data.length > 0) {
            const players = data.data;
            
            // Update podium
            if (players[0]) {
                document.getElementById('first-team').textContent = players[0].teamName;
                document.getElementById('first-score').textContent = players[0].totalScore + ' نقطة';
            }
            if (players[1]) {
                document.getElementById('second-team').textContent = players[1].teamName;
                document.getElementById('second-score').textContent = players[1].totalScore + ' نقطة';
            }
            if (players[2]) {
                document.getElementById('third-team').textContent = players[2].teamName;
                document.getElementById('third-score').textContent = players[2].totalScore + ' نقطة';
            }
            
            // Update table
            const tbody = document.getElementById('leaderboardTable');
            tbody.innerHTML = '';
            
            players.forEach((player, index) => {
                const row = document.createElement('tr');
                const rank = index + 1;
                const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : rank;
                
                row.innerHTML = `
                    <td>${medal}</td>
                    <td>${player.teamName}</td>
                    <td style="color: var(--primary-orange); font-weight: 700;">${player.totalScore}</td>
                    <td>${player.completedStages ? player.completedStages.length : 0}/10</td>
                `;
                
                tbody.appendChild(row);
            });
        }
    } catch (error) {
        console.error('Error loading leaderboard:', error);
    }
}

// ===== VICTORY =====
async function showVictory() {
    // Update player as winner
    if (gameState.currentStageId) {
        await fetch(`tables/players/${gameState.currentStageId}`, {
            method: 'PATCH',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                isWinner: true,
                completionTime: new Date().toISOString()
            })
        });
    }
    
    showScreen('victoryScreen');
    document.getElementById('winnerTeamName').textContent = gameState.teamName;
    document.getElementById('finalScore').textContent = gameState.totalScore;
    
    // Confetti effect (simple version)
    createConfetti();
}

function createConfetti() {
    const colors = ['#00ff88', '#ff6b35', '#ffffff', '#ffdd00'];
    for (let i = 0; i < 50; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.style.position = 'fixed';
            confetti.style.width = '10px';
            confetti.style.height = '10px';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.top = '-10px';
            confetti.style.borderRadius = '50%';
            confetti.style.zIndex = '9999';
            confetti.style.pointerEvents = 'none';
            document.body.appendChild(confetti);
            
            const animation = confetti.animate([
                { transform: 'translateY(0) rotate(0deg)', opacity: 1 },
                { transform: `translateY(${window.innerHeight + 20}px) rotate(${Math.random() * 360}deg)`, opacity: 0 }
            ], {
                duration: 3000 + Math.random() * 2000,
                easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
            });
            
            animation.onfinish = () => confetti.remove();
        }, i * 30);
    }
}

// ===== TREASURE INPUTS AUTO-FOCUS =====
function setupTreasureInputs() {
    const inputs = document.querySelectorAll('.treasure-input');
    inputs.forEach((input, index) => {
        input.addEventListener('input', function() {
            if (this.value.length === 1 && index < inputs.length - 1) {
                inputs[index + 1].focus();
            }
        });
        
        input.addEventListener('keydown', function(e) {
            if (e.key === 'Backspace' && this.value === '' && index > 0) {
                inputs[index - 1].focus();
            }
        });
    });
}

// ===== UTILITY FUNCTIONS =====
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 20px 30px;
        background: var(--card-bg);
        border-radius: 10px;
        box-shadow: var(--shadow-lg);
        z-index: 10000;
        animation: slideIn 0.3s ease;
        border-left: 4px solid ${type === 'success' ? 'var(--success)' : type === 'error' ? 'var(--danger)' : 'var(--primary-green)'};
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(400px); opacity: 0; }
    }
`;
document.head.appendChild(style);
