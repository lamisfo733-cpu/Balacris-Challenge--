// ===== ADMIN PANEL =====
let allPlayers = [];
let allQuestions = [];

async function loadAdminData() {
    await Promise.all([
        loadAllPlayers(),
        loadAllQuestions()
    ]);
    updateAdminStats();
}

async function loadAllPlayers() {
    try {
        const response = await fetch('tables/players?limit=1000');
        const data = await response.json();
        allPlayers = data.data || [];
        displayAdminPlayers();
    } catch (error) {
        console.error('Error loading players:', error);
    }
}

async function loadAllQuestions() {
    try {
        const response = await fetch('tables/questions?limit=1000');
        const data = await response.json();
        allQuestions = data.data || [];
        displayAdminQuestions();
    } catch (error) {
        console.error('Error loading questions:', error);
    }
}

function updateAdminStats() {
    const totalPlayers = allPlayers.length;
    const winners = allPlayers.filter(p => p.isWinner).length;
    const avgScore = allPlayers.length > 0 
        ? Math.round(allPlayers.reduce((sum, p) => sum + (p.totalScore || 0), 0) / allPlayers.length)
        : 0;
    
    document.getElementById('totalPlayers').textContent = totalPlayers;
    document.getElementById('totalWinners').textContent = winners;
    document.getElementById('avgScore').textContent = avgScore;
}

function displayAdminPlayers() {
    const tbody = document.getElementById('adminPlayersTable');
    tbody.innerHTML = '';
    
    if (allPlayers.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 40px; color: var(--text-gray);">
                    لا يوجد لاعبون بعد
                </td>
            </tr>
        `;
        return;
    }
    
    allPlayers.forEach(player => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${player.teamName}</td>
            <td>${player.email}</td>
            <td>${player.currentStage || 1}</td>
            <td style="color: var(--primary-orange); font-weight: 700;">${player.totalScore || 0}</td>
            <td>
                <button class="btn btn-small btn-danger" onclick="deletePlayer('${player.id}')" style="padding: 5px 10px;">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function displayAdminQuestions() {
    const container = document.getElementById('adminQuestionsList');
    
    if (allQuestions.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; color: var(--text-gray);">
                <p>لا توجد أسئلة بعد</p>
            </div>
        `;
        return;
    }
    
    // Group by stage
    const questionsByStage = {};
    allQuestions.forEach(q => {
        if (!questionsByStage[q.stage]) {
            questionsByStage[q.stage] = [];
        }
        questionsByStage[q.stage].push(q);
    });
    
    let html = '';
    Object.keys(questionsByStage).sort((a, b) => a - b).forEach(stage => {
        const questions = questionsByStage[stage];
        html += `
            <div style="background: var(--darker-bg); padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                <h4 style="color: var(--primary-green); margin-bottom: 15px;">
                    المرحلة ${stage} (${questions.length} أسئلة)
                </h4>
                <div style="display: grid; gap: 10px;">
        `;
        
        questions.forEach((q, index) => {
            html += `
                <div style="background: var(--card-bg); padding: 15px; border-radius: 8px; border-left: 3px solid var(--primary-orange);">
                    <div style="display: flex; justify-content: space-between; align-items: start;">
                        <div style="flex: 1;">
                            <p style="color: var(--text-light); font-weight: 600; margin-bottom: 8px;">
                                ${index + 1}. ${q.question}
                            </p>
                            <p style="color: var(--text-gray); font-size: 14px;">
                                الإجابة: ${q.correctAnswer} | النقاط: ${q.points}
                            </p>
                        </div>
                        <button class="btn btn-small btn-danger" onclick="deleteQuestion('${q.id}')" style="padding: 5px 10px; margin-right: 10px;">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        });
        
        html += `
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

async function deletePlayer(playerId) {
    if (!confirm('هل أنت متأكد من حذف هذا اللاعب؟')) return;
    
    try {
        await fetch(`tables/players/${playerId}`, {
            method: 'DELETE'
        });
        
        showNotification('تم حذف اللاعب بنجاح', 'success');
        await loadAllPlayers();
        updateAdminStats();
    } catch (error) {
        console.error('Error deleting player:', error);
        showNotification('حدث خطأ أثناء الحذف', 'error');
    }
}

async function deleteQuestion(questionId) {
    if (!confirm('هل أنت متأكد من حذف هذا السؤال؟')) return;
    
    try {
        await fetch(`tables/questions/${questionId}`, {
            method: 'DELETE'
        });
        
        showNotification('تم حذف السؤال بنجاح', 'success');
        await loadAllQuestions();
    } catch (error) {
        console.error('Error deleting question:', error);
        showNotification('حدث خطأ أثناء الحذف', 'error');
    }
}

function showAdminTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active from all buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(tabName + 'Tab').classList.add('active');
    
    // Activate button
    event.target.closest('.tab-btn').classList.add('active');
}

function showAddQuestion() {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        padding: 20px;
    `;
    
    modal.innerHTML = `
        <div style="background: var(--card-bg); padding: 40px; border-radius: 20px; max-width: 600px; width: 100%; max-height: 90vh; overflow-y: auto;">
            <h3 style="color: var(--primary-green); margin-bottom: 25px;">إضافة سؤال جديد</h3>
            
            <div class="form-group">
                <label>المرحلة</label>
                <select id="newQuestionStage" class="form-control" style="width: 100%; padding: 10px; background: var(--dark-bg); border: 2px solid var(--hover-bg); border-radius: 8px; color: var(--text-light);">
                    <option value="1">المرحلة 1</option>
                    <option value="2">المرحلة 2</option>
                    <option value="4">المرحلة 4</option>
                    <option value="5">المرحلة 5</option>
                    <option value="7">المرحلة 7</option>
                    <option value="8">المرحلة 8</option>
                    <option value="9">المرحلة 9</option>
                </select>
            </div>
            
            <div class="form-group">
                <label>السؤال</label>
                <textarea id="newQuestionText" class="form-control" rows="3" style="width: 100%; padding: 10px; background: var(--dark-bg); border: 2px solid var(--hover-bg); border-radius: 8px; color: var(--text-light); font-family: Cairo;"></textarea>
            </div>
            
            <div class="form-group">
                <label>الخيارات (افصلها بفاصلة)</label>
                <input type="text" id="newQuestionOptions" class="form-control" placeholder="خيار 1, خيار 2, خيار 3, خيار 4" style="width: 100%; padding: 10px; background: var(--dark-bg); border: 2px solid var(--hover-bg); border-radius: 8px; color: var(--text-light);">
            </div>
            
            <div class="form-group">
                <label>الإجابة الصحيحة</label>
                <input type="text" id="newQuestionAnswer" class="form-control" style="width: 100%; padding: 10px; background: var(--dark-bg); border: 2px solid var(--hover-bg); border-radius: 8px; color: var(--text-light);">
            </div>
            
            <div class="form-group">
                <label>النقاط</label>
                <input type="number" id="newQuestionPoints" class="form-control" value="10" style="width: 100%; padding: 10px; background: var(--dark-bg); border: 2px solid var(--hover-bg); border-radius: 8px; color: var(--text-light);">
            </div>
            
            <div class="form-group">
                <label>دليل (اختياري)</label>
                <input type="text" id="newQuestionClue" class="form-control" style="width: 100%; padding: 10px; background: var(--dark-bg); border: 2px solid var(--hover-bg); border-radius: 8px; color: var(--text-light);">
            </div>
            
            <div style="display: flex; gap: 15px; margin-top: 30px;">
                <button class="btn btn-primary" onclick="submitNewQuestion()" style="flex: 1;">
                    <i class="fas fa-plus"></i>
                    إضافة
                </button>
                <button class="btn btn-secondary" onclick="this.closest('div').parentElement.parentElement.remove()" style="flex: 1;">
                    <i class="fas fa-times"></i>
                    إلغاء
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

async function submitNewQuestion() {
    const stage = parseInt(document.getElementById('newQuestionStage').value);
    const question = document.getElementById('newQuestionText').value.trim();
    const optionsText = document.getElementById('newQuestionOptions').value.trim();
    const correctAnswer = document.getElementById('newQuestionAnswer').value.trim();
    const points = parseInt(document.getElementById('newQuestionPoints').value);
    const clue = document.getElementById('newQuestionClue').value.trim();
    
    if (!question || !optionsText || !correctAnswer) {
        showNotification('الرجاء ملء جميع الحقول المطلوبة', 'error');
        return;
    }
    
    const options = optionsText.split(',').map(o => o.trim());
    
    if (options.length < 2) {
        showNotification('يجب إدخال خيارين على الأقل', 'error');
        return;
    }
    
    const newQuestion = {
        stage: stage,
        question: question,
        options: options,
        correctAnswer: correctAnswer,
        points: points,
        clue: clue
    };
    
    try {
        await fetch('tables/questions', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(newQuestion)
        });
        
        showNotification('تمت إضافة السؤال بنجاح', 'success');
        await loadAllQuestions();
        
        // Close modal
        document.querySelector('div[style*="position: fixed"]').remove();
    } catch (error) {
        console.error('Error adding question:', error);
        showNotification('حدث خطأ أثناء الإضافة', 'error');
    }
}

async function resetAllData() {
    if (!confirm('⚠️ تحذير: هذا سيحذف جميع بيانات اللاعبين! هل أنت متأكد؟')) return;
    if (!confirm('هل أنت متأكد تماماً؟ لا يمكن التراجع عن هذا الإجراء!')) return;
    
    try {
        // Delete all players
        for (let player of allPlayers) {
            await fetch(`tables/players/${player.id}`, {
                method: 'DELETE'
            });
        }
        
        showNotification('تم إعادة تعيين جميع البيانات بنجاح', 'success');
        await loadAllPlayers();
        updateAdminStats();
    } catch (error) {
        console.error('Error resetting data:', error);
        showNotification('حدث خطأ أثناء إعادة التعيين', 'error');
    }
}

function exportData() {
    const data = {
        players: allPlayers,
        questions: allQuestions,
        exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `blaxx-data-${new Date().getTime()}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    showNotification('تم تصدير البيانات بنجاح', 'success');
}
