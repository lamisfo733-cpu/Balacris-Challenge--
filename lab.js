// ===== LAB SYSTEM =====
let selectedChemicals = [];
let attemptsLeft = 5;
const correctMixture = ['B', 'C', 'E']; // The correct combination

function initLab() {
    selectedChemicals = [];
    attemptsLeft = 5;
    document.getElementById('attempts').textContent = attemptsLeft;
    updateMixtureDisplay();
    
    // Reset all chemical selections
    document.querySelectorAll('.chemical-item').forEach(item => {
        item.classList.remove('selected');
    });
}

function selectChemical(chemical) {
    const chemicalItem = document.querySelector(`[data-chemical="${chemical}"]`);
    
    if (selectedChemicals.includes(chemical)) {
        // Deselect
        selectedChemicals = selectedChemicals.filter(c => c !== chemical);
        chemicalItem.classList.remove('selected');
    } else {
        // Select (max 3)
        if (selectedChemicals.length < 3) {
            selectedChemicals.push(chemical);
            chemicalItem.classList.add('selected');
        } else {
            showNotification('يمكنك اختيار 3 مواد فقط!', 'error');
        }
    }
    
    updateMixtureDisplay();
}

function updateMixtureDisplay() {
    const display = document.getElementById('selectedChemicals');
    const beakerContent = document.getElementById('mixtureContent');
    
    if (selectedChemicals.length === 0) {
        display.innerHTML = '<p style="color: var(--text-gray);">لم يتم اختيار مواد بعد</p>';
        beakerContent.style.height = '0';
        beakerContent.style.background = 'transparent';
    } else {
        display.innerHTML = `
            <p style="color: var(--primary-green); font-weight: 600;">
                المواد المختارة: ${selectedChemicals.join(' + ')}
            </p>
        `;
        
        // Update beaker visual
        const height = (selectedChemicals.length / 3) * 150;
        beakerContent.style.height = height + 'px';
        
        // Mix colors based on selected chemicals
        const colors = {
            'A': 'rgba(239, 68, 68, 0.7)',
            'B': 'rgba(59, 130, 246, 0.7)',
            'C': 'rgba(16, 185, 129, 0.7)',
            'D': 'rgba(245, 158, 11, 0.7)',
            'E': 'rgba(139, 92, 246, 0.7)',
            'F': 'rgba(255, 107, 53, 0.7)'
        };
        
        let mixedColor = colors[selectedChemicals[0]] || 'rgba(200, 200, 200, 0.5)';
        beakerContent.style.background = `linear-gradient(to top, ${mixedColor}, rgba(255, 255, 255, 0.3))`;
        
        // Add bubbling animation
        beakerContent.style.animation = 'bubble 2s infinite';
    }
}

function clearMixture() {
    selectedChemicals = [];
    document.querySelectorAll('.chemical-item').forEach(item => {
        item.classList.remove('selected');
    });
    updateMixtureDisplay();
}

async function testMixture() {
    if (selectedChemicals.length !== 3) {
        showNotification('يجب اختيار 3 مواد بالضبط!', 'error');
        return;
    }
    
    attemptsLeft--;
    document.getElementById('attempts').textContent = attemptsLeft;
    
    // Check if mixture is correct (order doesn't matter)
    const isCorrect = correctMixture.every(c => selectedChemicals.includes(c)) && 
                      selectedChemicals.every(c => correctMixture.includes(c));
    
    if (isCorrect) {
        await completeLabStage();
    } else {
        if (attemptsLeft <= 0) {
            failLabStage();
        } else {
            showMixtureFeedback();
        }
    }
}

function showMixtureFeedback() {
    // Check how many chemicals are correct
    const correctCount = selectedChemicals.filter(c => correctMixture.includes(c)).length;
    
    let feedbackMessage = '';
    let feedbackColor = '';
    
    if (correctCount === 3) {
        feedbackMessage = '✓ المزيج صحيح! لكن الترتيب غير صحيح';
        feedbackColor = 'var(--warning)';
    } else if (correctCount === 2) {
        feedbackMessage = '⚠️ مادتان صحيحتان، مادة واحدة خاطئة';
        feedbackColor = 'var(--warning)';
    } else if (correctCount === 1) {
        feedbackMessage = '⚠️ مادة واحدة فقط صحيحة';
        feedbackColor = 'var(--danger)';
    } else {
        feedbackMessage = '✗ المزيج خاطئ تماماً';
        feedbackColor = 'var(--danger)';
    }
    
    // Show visual feedback
    const beakerContent = document.getElementById('mixtureContent');
    beakerContent.style.animation = 'shake 0.5s';
    
    setTimeout(() => {
        beakerContent.style.animation = 'bubble 2s infinite';
    }, 500);
    
    // Create feedback popup
    const feedback = document.createElement('div');
    feedback.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: var(--card-bg);
        padding: 40px;
        border-radius: 20px;
        box-shadow: var(--shadow-lg);
        z-index: 10000;
        text-align: center;
        border: 3px solid ${feedbackColor};
        max-width: 400px;
    `;
    
    feedback.innerHTML = `
        <h3 style="color: ${feedbackColor}; margin-bottom: 20px; font-size: 24px;">
            ${feedbackMessage}
        </h3>
        <p style="color: var(--text-gray); margin-bottom: 20px;">
            المحاولات المتبقية: ${attemptsLeft}
        </p>
        <button class="btn btn-primary" onclick="this.parentElement.remove(); clearMixture();">
            حاول مرة أخرى
        </button>
    `;
    
    document.body.appendChild(feedback);
}

async function completeLabStage() {
    // Calculate score based on attempts used
    const score = 200 - ((5 - attemptsLeft) * 30);
    gameState.stageScores[6] = score;
    gameState.totalScore += score;
    
    if (!gameState.completedStages.includes(6)) {
        gameState.completedStages.push(6);
    }
    
    // Add clue
    if (!gameState.treasureClues.includes('المرحلة 6: FORMULA')) {
        gameState.treasureClues.push('المرحلة 6: FORMULA');
    }
    
    await saveProgress();
    
    // Show success animation
    const beakerContent = document.getElementById('mixtureContent');
    beakerContent.style.background = 'linear-gradient(to top, #00ff88, #00cc70)';
    beakerContent.style.animation = 'glow 1s infinite';
    
    // Create success popup
    const success = document.createElement('div');
    success.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: var(--card-bg);
        padding: 60px 40px;
        border-radius: 20px;
        box-shadow: var(--shadow-lg);
        z-index: 10000;
        text-align: center;
        border: 3px solid var(--success);
        max-width: 500px;
    `;
    
    success.innerHTML = `
        <div style="font-size: 80px; margin-bottom: 20px;">🎉</div>
        <h2 style="color: var(--success); margin-bottom: 20px; font-size: 32px;">
            مبروك! المزيج صحيح!
        </h2>
        <p style="color: var(--text-light); font-size: 20px; margin-bottom: 15px;">
            لقد أنشأت المزيج الصحيح: B + C + E
        </p>
        <div style="background: var(--darker-bg); padding: 20px; border-radius: 10px; margin: 20px 0;">
            <p style="color: var(--primary-orange); font-size: 28px; font-weight: 700;">
                ${score} نقطة
            </p>
        </div>
        <p style="color: var(--primary-green); font-size: 18px; margin-bottom: 30px;">
            <i class="fas fa-key"></i> حصلت على دليل للكنز!
        </p>
        <button class="btn btn-primary" onclick="this.parentElement.remove(); backToStages();">
            العودة للمراحل
        </button>
    `;
    
    document.body.appendChild(success);
    
    // Add confetti
    createLabConfetti();
}

function failLabStage() {
    const failure = document.createElement('div');
    failure.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: var(--card-bg);
        padding: 60px 40px;
        border-radius: 20px;
        box-shadow: var(--shadow-lg);
        z-index: 10000;
        text-align: center;
        border: 3px solid var(--danger);
        max-width: 500px;
    `;
    
    failure.innerHTML = `
        <div style="font-size: 80px; margin-bottom: 20px;">😔</div>
        <h2 style="color: var(--danger); margin-bottom: 20px; font-size: 32px;">
            نفذت المحاولات!
        </h2>
        <p style="color: var(--text-gray); font-size: 18px; margin-bottom: 30px;">
            المزيج الصحيح كان: B + C + E
        </p>
        <div style="display: flex; gap: 15px; justify-content: center;">
            <button class="btn btn-primary" onclick="this.parentElement.remove(); initLab();">
                حاول مرة أخرى
            </button>
            <button class="btn btn-secondary" onclick="this.parentElement.remove(); backToStages();">
                العودة للمراحل
            </button>
        </div>
    `;
    
    document.body.appendChild(failure);
}

function createLabConfetti() {
    const colors = ['#00ff88', '#3b82f6', '#10b981', '#8b5cf6'];
    for (let i = 0; i < 30; i++) {
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

// Add CSS animations
const labStyle = document.createElement('style');
labStyle.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-10px); }
        75% { transform: translateX(10px); }
    }
    @keyframes glow {
        0%, 100% { box-shadow: 0 0 20px rgba(0, 255, 136, 0.5); }
        50% { box-shadow: 0 0 40px rgba(0, 255, 136, 1); }
    }
`;
document.head.appendChild(labStyle);
