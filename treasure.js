// ===== TREASURE HUNT =====
function initTreasureHunt() {
    // Display collected clues
    displayClues();
    
    // Clear treasure inputs
    for (let i = 1; i <= 20; i++) {
        const input = document.getElementById(`t${i}`);
        if (input) input.value = '';
    }
}

function displayClues() {
    const cluesList = document.getElementById('cluesList');
    
    if (gameState.treasureClues.length === 0) {
        cluesList.innerHTML = `
            <div style="text-align: center; padding: 40px; color: var(--text-gray);">
                <i class="fas fa-exclamation-triangle" style="font-size: 48px; margin-bottom: 20px;"></i>
                <p style="font-size: 18px;">لم تجمع أي أدلة بعد!</p>
                <p style="margin-top: 10px;">أكمل المراحل السابقة لجمع الأدلة</p>
            </div>
        `;
    } else {
        let cluesHTML = '<div style="display: grid; gap: 15px;">';
        
        gameState.treasureClues.forEach((clue, index) => {
            cluesHTML += `
                <div class="clue-item" style="animation: slideIn 0.5s ease ${index * 0.1}s both;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <i class="fas fa-key" style="color: var(--primary-orange);"></i>
                        <span style="color: var(--text-light); font-weight: 600;">${clue}</span>
                    </div>
                </div>
            `;
        });
        
        cluesHTML += '</div>';
        cluesList.innerHTML = cluesHTML;
    }
}

async function unlockTreasure() {
    // Get all inputs
    let code = '';
    for (let i = 1; i <= 20; i++) {
        const input = document.getElementById(`t${i}`);
        if (input) {
            code += input.value.toUpperCase();
        }
    }
    
    // The correct code is built from all the clues collected
    // From Stage 1 questions: B, 7, X, 3, C, 9, R, 1, E, 5
    // From Stage 2 questions: S, 2, T, 8, A, 4, G, 6, E, 0
    // Correct code: B7X3C9R1E5S2T8A4G6E0
    const correctCode = 'B7X3C9R1E5S2T8A4G6E0';
    
    if (code === correctCode) {
        await completeTreasureHunt();
    } else {
        // Give hints based on how close they are
        let correctChars = 0;
        for (let i = 0; i < Math.min(code.length, correctCode.length); i++) {
            if (code[i] === correctCode[i]) {
                correctChars++;
            }
        }
        
        const percentage = Math.round((correctChars / correctCode.length) * 100);
        
        let hintMessage = '';
        if (percentage >= 80) {
            hintMessage = 'قريب جداً! تحقق من الأحرف مرة أخرى';
        } else if (percentage >= 50) {
            hintMessage = 'على الطريق الصحيح! بعض الأحرف خاطئة';
        } else if (percentage >= 25) {
            hintMessage = 'استخدم الأدلة من المراحل السابقة بالترتيب';
        } else {
            hintMessage = 'الكود خاطئ. راجع جميع الأدلة المجمعة';
        }
        
        showNotification(`✗ ${hintMessage} (${percentage}% صحيح)`, 'error');
        
        // Highlight wrong inputs
        for (let i = 0; i < code.length; i++) {
            const input = document.getElementById(`t${i + 1}`);
            if (input) {
                if (i < correctCode.length && code[i] !== correctCode[i]) {
                    input.style.borderColor = 'var(--danger)';
                    input.style.animation = 'shake 0.5s';
                    
                    setTimeout(() => {
                        input.style.borderColor = 'var(--primary-green)';
                        input.style.animation = '';
                    }, 1000);
                } else if (i < correctCode.length && code[i] === correctCode[i]) {
                    input.style.borderColor = 'var(--success)';
                }
            }
        }
    }
}

async function completeTreasureHunt() {
    // Calculate final score
    const treasureScore = 300;
    gameState.stageScores[10] = treasureScore;
    gameState.totalScore += treasureScore;
    
    if (!gameState.completedStages.includes(10)) {
        gameState.completedStages.push(10);
    }
    
    await saveProgress();
    
    // Open treasure chest animation
    const chest = document.getElementById('treasureChest');
    chest.style.animation = 'treasureOpen 2s ease forwards';
    chest.style.color = '#FFD700';
    
    // Wait for animation
    setTimeout(() => {
        // Check if all stages completed
        if (gameState.completedStages.length === 10) {
            showVictory();
        } else {
            showTreasureSuccess();
        }
    }, 2000);
}

function showTreasureSuccess() {
    const success = document.createElement('div');
    success.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: var(--card-bg);
        padding: 60px 40px;
        border-radius: 20px;
        box-shadow: 0 0 50px rgba(255, 215, 0, 0.5);
        z-index: 10000;
        text-align: center;
        border: 3px solid #FFD700;
        max-width: 600px;
    `;
    
    success.innerHTML = `
        <div style="font-size: 100px; margin-bottom: 20px;">🏆</div>
        <h2 style="color: #FFD700; margin-bottom: 20px; font-size: 36px; text-shadow: 0 0 20px rgba(255, 215, 0, 0.5);">
            مبروك! وجدت الكنز!
        </h2>
        <p style="color: var(--text-light); font-size: 20px; margin-bottom: 20px;">
            لقد فتحت صندوق كنز بلاكرس بنجاح!
        </p>
        <div style="background: var(--darker-bg); padding: 30px; border-radius: 15px; margin: 20px 0;">
            <h3 style="color: var(--text-light); margin-bottom: 15px;">المكافأة</h3>
            <p style="font-size: 48px; color: var(--primary-orange); font-weight: 700; margin-bottom: 10px;">
                300 نقطة
            </p>
            <p style="color: var(--text-gray);">+ كأس بلاكرس الذهبي</p>
        </div>
        <div style="background: rgba(0, 255, 136, 0.1); padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid var(--primary-green);">
            <p style="color: var(--primary-green); font-size: 18px;">
                <i class="fas fa-trophy"></i> أكملت جميع المراحل بنجاح!
            </p>
        </div>
        <button class="btn btn-primary" style="font-size: 20px;" onclick="this.parentElement.remove(); showVictory();">
            احتفل بالفوز! 🎉
        </button>
    `;
    
    document.body.appendChild(success);
    
    // Create treasure confetti
    createTreasureConfetti();
}

function createTreasureConfetti() {
    const colors = ['#FFD700', '#FFA500', '#00ff88', '#ff6b35', '#ffffff'];
    const shapes = ['💎', '⭐', '✨', '🏆', '👑', '💰'];
    
    for (let i = 0; i < 50; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            
            // Random between emoji and colored circle
            if (Math.random() > 0.5) {
                confetti.textContent = shapes[Math.floor(Math.random() * shapes.length)];
                confetti.style.fontSize = '24px';
            } else {
                confetti.style.width = '12px';
                confetti.style.height = '12px';
                confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                confetti.style.borderRadius = '50%';
            }
            
            confetti.style.position = 'fixed';
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.top = '-50px';
            confetti.style.zIndex = '9999';
            confetti.style.pointerEvents = 'none';
            document.body.appendChild(confetti);
            
            const animation = confetti.animate([
                { 
                    transform: 'translateY(0) rotate(0deg) scale(1)', 
                    opacity: 1 
                },
                { 
                    transform: `translateY(${window.innerHeight + 100}px) rotate(${Math.random() * 720}deg) scale(${Math.random() * 2})`, 
                    opacity: 0 
                }
            ], {
                duration: 3000 + Math.random() * 2000,
                easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
            });
            
            animation.onfinish = () => confetti.remove();
        }, i * 50);
    }
}

// Add CSS animations
const treasureStyle = document.createElement('style');
treasureStyle.textContent = `
    @keyframes treasureOpen {
        0% {
            transform: scale(1) rotate(0deg);
        }
        25% {
            transform: scale(1.2) rotate(-10deg);
        }
        50% {
            transform: scale(1.3) rotate(10deg);
        }
        75% {
            transform: scale(1.2) rotate(-5deg);
        }
        100% {
            transform: scale(1.5) rotate(0deg);
            filter: drop-shadow(0 0 30px rgba(255, 215, 0, 1));
        }
    }
    
    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateX(50px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
`;
document.head.appendChild(treasureStyle);
