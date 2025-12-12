// ===== QUIZ SYSTEM =====
let currentQuestions = [];
let currentQuestionIndex = 0;
let quizScore = 0;
let answeredQuestions = 0;

async function initQuiz(stageNum) {
    showScreen('quizScreen');
    
    // Reset quiz state
    currentQuestionIndex = 0;
    quizScore = 0;
    answeredQuestions = 0;
    
    // Load questions for this stage
    try {
        const response = await fetch(`tables/questions?search=${stageNum}`);
        const data = await response.json();
        
        if (data.data && data.data.length > 0) {
            currentQuestions = data.data.filter(q => q.stage === stageNum);
            
            if (currentQuestions.length === 0) {
                // If no questions exist for this stage, create sample questions
                await createSampleQuestions(stageNum);
                // Reload questions
                const response2 = await fetch(`tables/questions?search=${stageNum}`);
                const data2 = await response2.json();
                currentQuestions = data2.data.filter(q => q.stage === stageNum);
            }
            
            // Shuffle questions
            currentQuestions = shuffleArray(currentQuestions);
            
            // Update quiz display
            document.getElementById('currentStageDisplay').textContent = `المرحلة ${stageNum}`;
            document.getElementById('quizScore').textContent = quizScore;
            
            // Show first question
            showQuestion();
        } else {
            alert('لا توجد أسئلة متاحة لهذه المرحلة');
            backToStages();
        }
    } catch (error) {
        console.error('Error loading questions:', error);
        alert('حدث خطأ في تحميل الأسئلة');
        backToStages();
    }
}

function showQuestion() {
    if (currentQuestionIndex >= currentQuestions.length) {
        completeQuiz();
        return;
    }
    
    const question = currentQuestions[currentQuestionIndex];
    
    // Update question counter
    document.getElementById('questionCounter').textContent = 
        `${currentQuestionIndex + 1}/${currentQuestions.length}`;
    
    // Display question
    document.getElementById('questionText').textContent = question.question;
    
    // Display options
    const optionsContainer = document.getElementById('optionsContainer');
    optionsContainer.innerHTML = '';
    
    const options = question.options || [];
    options.forEach((option, index) => {
        const button = document.createElement('button');
        button.className = 'option-btn';
        button.textContent = option;
        button.onclick = () => checkAnswer(option, question);
        optionsContainer.appendChild(button);
    });
    
    // Hide feedback
    document.getElementById('feedbackContainer').classList.add('hidden');
}

function checkAnswer(selectedAnswer, question) {
    answeredQuestions++;
    
    const isCorrect = selectedAnswer === question.correctAnswer;
    const feedbackContainer = document.getElementById('feedbackContainer');
    const optionButtons = document.querySelectorAll('.option-btn');
    
    // Disable all buttons
    optionButtons.forEach(btn => {
        btn.disabled = true;
        if (btn.textContent === question.correctAnswer) {
            btn.classList.add('correct');
        } else if (btn.textContent === selectedAnswer && !isCorrect) {
            btn.classList.add('wrong');
        }
    });
    
    // Update score
    if (isCorrect) {
        quizScore += question.points || 10;
        document.getElementById('quizScore').textContent = quizScore;
        
        // Add clue to treasure clues if available
        if (question.clue && !gameState.treasureClues.includes(question.clue)) {
            gameState.treasureClues.push(question.clue);
        }
    }
    
    // Show feedback
    feedbackContainer.classList.remove('hidden');
    feedbackContainer.className = `feedback-container ${isCorrect ? 'correct' : 'wrong'}`;
    
    let feedbackHTML = `
        <h4 style="color: ${isCorrect ? 'var(--success)' : 'var(--danger)'}">
            ${isCorrect ? '✓ إجابة صحيحة!' : '✗ إجابة خاطئة'}
        </h4>
        <p>الإجابة الصحيحة: ${question.correctAnswer}</p>
    `;
    
    if (isCorrect && question.clue) {
        feedbackHTML += `
            <div style="margin-top: 15px; padding: 15px; background: var(--darker-bg); border-radius: 8px; border-left: 4px solid var(--primary-green);">
                <p style="color: var(--primary-green); font-weight: 600;">
                    <i class="fas fa-key"></i> دليل للكنز: ${question.clue}
                </p>
            </div>
        `;
    }
    
    feedbackHTML += `
        <button class="btn btn-primary" style="margin-top: 20px; width: auto;" onclick="nextQuestion()">
            ${currentQuestionIndex < currentQuestions.length - 1 ? 'السؤال التالي' : 'إنهاء'}
            <i class="fas fa-arrow-left"></i>
        </button>
    `;
    
    feedbackContainer.innerHTML = feedbackHTML;
}

function nextQuestion() {
    currentQuestionIndex++;
    showQuestion();
}

async function completeQuiz() {
    // Calculate final score
    const maxScore = currentQuestions.length * 10;
    const percentage = (quizScore / maxScore) * 100;
    
    // Update game state
    gameState.stageScores[currentStage] = quizScore;
    gameState.totalScore += quizScore;
    
    if (!gameState.completedStages.includes(currentStage)) {
        gameState.completedStages.push(currentStage);
    }
    
    // Save progress
    await saveProgress();
    
    // Show completion message
    const container = document.querySelector('.quiz-container');
    container.innerHTML = `
        <div style="text-align: center; padding: 60px 20px;">
            <div style="font-size: 100px; margin-bottom: 30px;">
                ${percentage >= 80 ? '🎉' : percentage >= 60 ? '👍' : '💪'}
            </div>
            <h2 style="color: var(--primary-green); font-size: 36px; margin-bottom: 20px;">
                أحسنت!
            </h2>
            <p style="font-size: 24px; color: var(--text-gray); margin-bottom: 30px;">
                لقد أكملت المرحلة ${currentStage}
            </p>
            <div style="background: var(--card-bg); padding: 30px; border-radius: 15px; margin-bottom: 30px;">
                <h3 style="color: var(--text-light); margin-bottom: 15px;">النتيجة</h3>
                <p style="font-size: 48px; color: var(--primary-orange); font-weight: 700;">
                    ${quizScore}/${maxScore}
                </p>
                <p style="color: var(--text-gray); margin-top: 10px;">
                    ${Math.round(percentage)}% صحيحة
                </p>
            </div>
            <div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
                <button class="btn btn-primary" onclick="backToStages()">
                    <i class="fas fa-home"></i>
                    العودة للمراحل
                </button>
                ${gameState.completedStages.length < 10 ? `
                    <button class="btn btn-secondary" onclick="startStage(${getNextStage()})">
                        <i class="fas fa-arrow-left"></i>
                        المرحلة التالية
                    </button>
                ` : ''}
            </div>
        </div>
    `;
    
    updatePlayerDisplay();
}

function getNextStage() {
    const allStages = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    for (let stage of allStages) {
        if (!gameState.completedStages.includes(stage)) {
            return stage;
        }
    }
    return 10;
}

// ===== SAMPLE QUESTIONS CREATION =====
async function createSampleQuestions(stageNum) {
    const sampleQuestions = {
        4: [
            {
                stage: 4,
                question: 'ما هو أول روبوت صنعه فريق بلاكرس؟',
                options: ['روبوت التنظيف', 'روبوت المراقبة', 'روبوت التعليم', 'روبوت الإنقاذ'],
                correctAnswer: 'روبوت التعليم',
                points: 10,
                clue: ''
            },
            {
                stage: 4,
                question: 'كم عدد المسابقات التي شارك فيها الفريق؟',
                options: ['3', '5', '7', '10'],
                correctAnswer: '7',
                points: 10,
                clue: ''
            },
            {
                stage: 4,
                question: 'ما هي أحدث تقنية يعمل عليها الفريق؟',
                options: ['الواقع المعزز', 'الذكاء الاصطناعي', 'الروبوتات الطائرة', 'الطباعة ثلاثية الأبعاد'],
                correctAnswer: 'الذكاء الاصطناعي',
                points: 10,
                clue: ''
            },
            {
                stage: 4,
                question: 'ما هو الهدف الرئيسي للفريق؟',
                options: ['الربح المادي', 'التعليم والابتكار', 'الشهرة', 'المنافسة'],
                correctAnswer: 'التعليم والابتكار',
                points: 10,
                clue: ''
            },
            {
                stage: 4,
                question: 'أي برنامج يستخدم الفريق للتصميم؟',
                options: ['AutoCAD', 'SolidWorks', 'Fusion 360', 'كل ما سبق'],
                correctAnswer: 'كل ما سبق',
                points: 10,
                clue: ''
            },
            {
                stage: 4,
                question: 'ما هو شعار الفريق في المسابقات؟',
                options: ['الفوز دائماً', 'التعلم من الفشل', 'نحن الأفضل', 'السرعة والدقة'],
                correctAnswer: 'التعلم من الفشل',
                points: 10,
                clue: ''
            },
            {
                stage: 4,
                question: 'كم عدد الطلاب الذين تدربوا مع الفريق في آخر ورشة؟',
                options: ['20', '30', '40', '50'],
                correctAnswer: '30',
                points: 10,
                clue: ''
            },
            {
                stage: 4,
                question: 'ما هي مدة التدريب في الفريق للمبتدئين؟',
                options: ['شهر', 'شهرين', '3 أشهر', '6 أشهر'],
                correctAnswer: '3 أشهر',
                points: 10,
                clue: ''
            },
            {
                stage: 4,
                question: 'أي جامعة يتعاون معها الفريق؟',
                options: ['جامعة القاهرة', 'الجامعة الأمريكية', 'جامعة عين شمس', 'كل ما سبق'],
                correctAnswer: 'كل ما سبق',
                points: 10,
                clue: ''
            },
            {
                stage: 4,
                question: 'ما هو مشروع الفريق القادم؟',
                options: ['روبوت طبي', 'سيارة ذاتية القيادة', 'طائرة بدون طيار', 'نظام أمني ذكي'],
                correctAnswer: 'روبوت طبي',
                points: 10,
                clue: ''
            }
        ],
        5: [
            {
                stage: 5,
                question: 'ما هي قيمة الفريق الأساسية؟',
                options: ['التنافس', 'التعاون والابتكار', 'الربح', 'الشهرة'],
                correctAnswer: 'التعاون والابتكار',
                points: 10,
                clue: ''
            },
            {
                stage: 5,
                question: 'كم عدد أعضاء فريق التطوير؟',
                options: ['5', '8', '10', '12'],
                correctAnswer: '8',
                points: 10,
                clue: ''
            },
            {
                stage: 5,
                question: 'ما هو اسم مشروع التخرج للفريق؟',
                options: ['روبوت المستقبل', 'الذكاء الصناعي', 'مدينة ذكية', 'نظام آلي متكامل'],
                correctAnswer: 'نظام آلي متكامل',
                points: 10,
                clue: ''
            },
            {
                stage: 5,
                question: 'أي لغة برمجة يفضلها الفريق لتطوير الروبوتات؟',
                options: ['Python', 'C++', 'Java', 'Python و C++'],
                correctAnswer: 'Python و C++',
                points: 10,
                clue: ''
            },
            {
                stage: 5,
                question: 'ما هو شعار ورش العمل للفريق؟',
                options: ['تعلم بسرعة', 'اصنع مستقبلك', 'كن مبدعاً', 'ابتكر وتعلم'],
                correctAnswer: 'ابتكر وتعلم',
                points: 10,
                clue: ''
            },
            {
                stage: 5,
                question: 'كم عدد الجوائز الدولية للفريق؟',
                options: ['1', '2', '3', '4'],
                correctAnswer: '2',
                points: 10,
                clue: ''
            },
            {
                stage: 5,
                question: 'ما هي رؤية الفريق للمستقبل؟',
                options: ['أن نكون الأفضل', 'تمكين الشباب بالتكنولوجيا', 'الربح المادي', 'الانتشار العالمي'],
                correctAnswer: 'تمكين الشباب بالتكنولوجيا',
                points: 10,
                clue: ''
            },
            {
                stage: 5,
                question: 'أي نوع من الروبوتات يتخصص فيه الفريق؟',
                options: ['روبوتات صناعية', 'روبوتات تعليمية', 'روبوتات طبية', 'كل ما سبق'],
                correctAnswer: 'روبوتات تعليمية',
                points: 10,
                clue: ''
            },
            {
                stage: 5,
                question: 'ما هو اسم المعمل الخاص بالفريق؟',
                options: ['معمل الإبداع', 'معمل بلاكرس', 'معمل الروبوتات', 'معمل المستقبل'],
                correctAnswer: 'معمل بلاكرس',
                points: 10,
                clue: ''
            },
            {
                stage: 5,
                question: 'كم عدد المشاريع المفتوحة المصدر للفريق؟',
                options: ['3', '5', '7', '10'],
                correctAnswer: '5',
                points: 10,
                clue: ''
            }
        ],
        7: [
            {
                stage: 7,
                question: 'ما هي لغة البرمجة الأكثر استخداماً في مشاريع الفريق؟',
                options: ['Python', 'JavaScript', 'C++', 'Java'],
                correctAnswer: 'Python',
                points: 10,
                clue: ''
            },
            {
                stage: 7,
                question: 'أي منصة يستخدم الفريق لإدارة المشاريع؟',
                options: ['GitHub', 'GitLab', 'Bitbucket', 'كل ما سبق'],
                correctAnswer: 'GitHub',
                points: 10,
                clue: ''
            },
            {
                stage: 7,
                question: 'ما هو نظام التشغيل المفضل لتطوير الروبوتات؟',
                options: ['Windows', 'Linux', 'MacOS', 'Ubuntu'],
                correctAnswer: 'Ubuntu',
                points: 10,
                clue: ''
            },
            {
                stage: 7,
                question: 'أي إطار عمل يستخدم الفريق للذكاء الاصطناعي؟',
                options: ['TensorFlow', 'PyTorch', 'Keras', 'TensorFlow و PyTorch'],
                correctAnswer: 'TensorFlow و PyTorch',
                points: 10,
                clue: ''
            },
            {
                stage: 7,
                question: 'ما هو المتحكم الدقيق المفضل للفريق؟',
                options: ['Arduino', 'Raspberry Pi', 'ESP32', 'كل ما سبق'],
                correctAnswer: 'كل ما سبق',
                points: 10,
                clue: ''
            },
            {
                stage: 7,
                question: 'أي بروتوكول اتصال يستخدم الفريق للروبوتات؟',
                options: ['Bluetooth', 'WiFi', 'ZigBee', 'كل ما سبق'],
                correctAnswer: 'كل ما سبق',
                points: 10,
                clue: ''
            },
            {
                stage: 7,
                question: 'ما هي قاعدة البيانات المستخدمة في المشاريع؟',
                options: ['MySQL', 'MongoDB', 'PostgreSQL', 'SQLite'],
                correctAnswer: 'MongoDB',
                points: 10,
                clue: ''
            },
            {
                stage: 7,
                question: 'أي محرر أكواد يفضله أعضاء الفريق؟',
                options: ['VS Code', 'PyCharm', 'Sublime Text', 'VS Code و PyCharm'],
                correctAnswer: 'VS Code و PyCharm',
                points: 10,
                clue: ''
            },
            {
                stage: 7,
                question: 'ما هو نظام التحكم بالإصدار المستخدم؟',
                options: ['Git', 'SVN', 'Mercurial', 'Perforce'],
                correctAnswer: 'Git',
                points: 10,
                clue: ''
            },
            {
                stage: 7,
                question: 'أي أداة يستخدم الفريق للتصميم ثلاثي الأبعاد؟',
                options: ['Blender', 'Fusion 360', 'SolidWorks', 'كل ما سبق'],
                correctAnswer: 'كل ما سبق',
                points: 10,
                clue: ''
            }
        ],
        8: [
            {
                stage: 8,
                question: 'ما هو هدف الفريق للعام القادم؟',
                options: ['مشروع جديد', 'مسابقة دولية', 'توسيع الفريق', 'كل ما سبق'],
                correctAnswer: 'كل ما سبق',
                points: 10,
                clue: ''
            },
            {
                stage: 8,
                question: 'كم عدد الشراكات التي أقامها الفريق؟',
                options: ['2', '4', '6', '8'],
                correctAnswer: '6',
                points: 10,
                clue: ''
            },
            {
                stage: 8,
                question: 'ما هي أكبر مسابقة شارك فيها الفريق؟',
                options: ['مسابقة محلية', 'مسابقة إقليمية', 'مسابقة دولية', 'أولمبياد الروبوتات'],
                correctAnswer: 'أولمبياد الروبوتات',
                points: 10,
                clue: ''
            },
            {
                stage: 8,
                question: 'ما هو عدد الساعات التدريبية الأسبوعية؟',
                options: ['5', '10', '15', '20'],
                correctAnswer: '15',
                points: 10,
                clue: ''
            },
            {
                stage: 8,
                question: 'أي مجال يريد الفريق التوسع فيه؟',
                options: ['الطب', 'الزراعة', 'التعليم', 'كل ما سبق'],
                correctAnswer: 'كل ما سبق',
                points: 10,
                clue: ''
            },
            {
                stage: 8,
                question: 'ما هو اسم أول مشروع للفريق؟',
                options: ['روبوت ألفا', 'بلاكس-1', 'روبو-تيك', 'الروبوت الذكي'],
                correctAnswer: 'بلاكس-1',
                points: 10,
                clue: ''
            },
            {
                stage: 8,
                question: 'كم عدد براءات الاختراع للفريق؟',
                options: ['0', '1', '2', '3'],
                correctAnswer: '2',
                points: 10,
                clue: ''
            },
            {
                stage: 8,
                question: 'ما هي رسالة الفريق الأساسية؟',
                options: ['الابتكار', 'التعليم', 'التمكين', 'كل ما سبق'],
                correctAnswer: 'كل ما سبق',
                points: 10,
                clue: ''
            },
            {
                stage: 8,
                question: 'أي دولة زارها الفريق للمشاركة في مسابقة؟',
                options: ['الإمارات', 'السعودية', 'تركيا', 'كل ما سبق'],
                correctAnswer: 'كل ما سبق',
                points: 10,
                clue: ''
            },
            {
                stage: 8,
                question: 'ما هو شعار الفريق الجديد؟',
                options: ['نحو المستقبل', 'نبتكر لنغير', 'معاً نصنع الفرق', 'الابتكار طريقنا'],
                correctAnswer: 'نبتكر لنغير',
                points: 10,
                clue: ''
            }
        ],
        9: [
            {
                stage: 9,
                question: 'ما هو السر وراء نجاح فريق بلاكرس؟',
                options: ['العمل الجماعي', 'الإبداع', 'الإصرار', 'كل ما سبق'],
                correctAnswer: 'كل ما سبق',
                points: 10,
                clue: ''
            },
            {
                stage: 9,
                question: 'ما هي رسالة الفريق للأجيال القادمة؟',
                options: ['لا تستسلم', 'ابتكر مستقبلك', 'تعلم دائماً', 'كن مبدعاً'],
                correctAnswer: 'ابتكر مستقبلك',
                points: 10,
                clue: ''
            },
            {
                stage: 9,
                question: 'ما هو أكبر تحدي واجه الفريق؟',
                options: ['نقص التمويل', 'قلة الخبرة', 'المنافسة القوية', 'كل ما سبق'],
                correctAnswer: 'كل ما سبق',
                points: 10,
                clue: ''
            },
            {
                stage: 9,
                question: 'كيف تغلب الفريق على التحديات؟',
                options: ['بالتعاون', 'بالإصرار', 'بالتخطيط', 'كل ما سبق'],
                correctAnswer: 'كل ما سبق',
                points: 10,
                clue: ''
            },
            {
                stage: 9,
                question: 'ما هي أهم قيمة تعلمها الفريق؟',
                options: ['الصبر', 'العمل الجماعي', 'الإبداع', 'التعلم المستمر'],
                correctAnswer: 'التعلم المستمر',
                points: 10,
                clue: ''
            },
            {
                stage: 9,
                question: 'ما هو حلم الفريق الأكبر؟',
                options: ['الشهرة العالمية', 'تغيير العالم بالتكنولوجيا', 'الربح المادي', 'الفوز بجوائز'],
                correctAnswer: 'تغيير العالم بالتكنولوجيا',
                points: 10,
                clue: ''
            },
            {
                stage: 9,
                question: 'ما هي نصيحة الفريق للمبتدئين؟',
                options: ['ابدأ الآن', 'لا تخف من الفشل', 'تعلم من الأخطاء', 'كل ما سبق'],
                correctAnswer: 'كل ما سبق',
                points: 10,
                clue: ''
            },
            {
                stage: 9,
                question: 'ما هو مفتاح النجاح حسب الفريق؟',
                options: ['الموهبة', 'العمل الجاد', 'الحظ', 'الإصرار'],
                correctAnswer: 'العمل الجاد',
                points: 10,
                clue: ''
            },
            {
                stage: 9,
                question: 'ما هي رؤية الفريق بعد 10 سنوات؟',
                options: ['فريق عالمي', 'شركة ناشئة', 'مركز تدريب', 'كل ما سبق'],
                correctAnswer: 'كل ما سبق',
                points: 10,
                clue: ''
            },
            {
                stage: 9,
                question: 'ما هو الشيء الذي يميز بلاكرس عن غيره؟',
                options: ['الشغف', 'الإبداع', 'روح الفريق', 'كل ما سبق'],
                correctAnswer: 'كل ما سبق',
                points: 10,
                clue: ''
            }
        ]
    };
    
    if (sampleQuestions[stageNum]) {
        for (let question of sampleQuestions[stageNum]) {
            try {
                await fetch('tables/questions', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify(question)
                });
            } catch (error) {
                console.error('Error creating question:', error);
            }
        }
    }
}

// ===== UTILITY FUNCTIONS =====
function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}
