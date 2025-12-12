# 🛠️ التوثيق التقني - موقع بلاكرس

## 📋 جدول المحتويات
1. [نظرة عامة على البنية](#نظرة-عامة-على-البنية)
2. [قاعدة البيانات](#قاعدة-البيانات)
3. [واجهة برمجة التطبيقات](#واجهة-برمجة-التطبيقات)
4. [الملفات والوحدات](#الملفات-والوحدات)
5. [تدفق العمل](#تدفق-العمل)
6. [التخزين المحلي](#التخزين-المحلي)
7. [الأمان](#الأمان)
8. [التحسينات المستقبلية](#التحسينات-المستقبلية)

---

## 🏗️ نظرة عامة على البنية

### Architecture Pattern
```
┌─────────────────────────────────────┐
│         Frontend Layer              │
│  (HTML/CSS/JavaScript - SPA)        │
├─────────────────────────────────────┤
│       State Management              │
│    (localStorage + gameState)       │
├─────────────────────────────────────┤
│         API Layer                   │
│    (RESTful Table API)              │
├─────────────────────────────────────┤
│       Database Layer                │
│  (tables: players, questions)       │
└─────────────────────────────────────┘
```

### Technology Stack
- **Frontend**: HTML5, CSS3, JavaScript ES6+
- **Graphics**: Canvas API (for Mario game)
- **Storage**: localStorage + RESTful Table API
- **Fonts**: Google Fonts (Cairo, Press Start 2P)
- **Icons**: Font Awesome 6

---

## 💾 قاعدة البيانات

### Schema Design

#### جدول `players`
```javascript
{
  id: String (UUID),                    // معرف فريد
  teamName: String,                     // اسم الفريق
  email: String,                        // البريد الإلكتروني
  currentStage: Number (1-10),          // المرحلة الحالية
  totalScore: Number,                   // إجمالي النقاط
  completedStages: Array<Number>,       // المراحل المكتملة
  stageScores: String (JSON),           // نقاط كل مرحلة
  treasureClues: Array<String>,         // الأدلة المجمعة
  isWinner: Boolean,                    // أكمل كل المراحل؟
  completionTime: DateTime,             // وقت الإكمال
  created_at: Timestamp,                // تاريخ الإنشاء
  updated_at: Timestamp,                // تاريخ آخر تحديث
  gs_project_id: String,                // معرف المشروع
  gs_table_name: String                 // اسم الجدول
}
```

#### جدول `questions`
```javascript
{
  id: String (UUID),                    // معرف فريد
  stage: Number (1-9),                  // رقم المرحلة
  question: String,                     // نص السؤال
  options: Array<String>,               // خيارات الإجابة
  correctAnswer: String,                // الإجابة الصحيحة
  points: Number (default: 10),         // النقاط
  clue: String,                         // دليل للكنز
  created_at: Timestamp,                // تاريخ الإنشاء
  updated_at: Timestamp,                // تاريخ آخر تحديث
  gs_project_id: String,                // معرف المشروع
  gs_table_name: String                 // اسم الجدول
}
```

### Indexes
```javascript
// Recommended indexes for performance
players:
  - email (unique)
  - totalScore (descending)
  - isWinner
  
questions:
  - stage
  - created_at
```

---

## 🔌 واجهة برمجة التطبيقات

### Base URL
```
Relative paths (same origin)
```

### Endpoints

#### 1. List Players
```http
GET /tables/players
```

**Query Parameters:**
- `page`: رقم الصفحة (default: 1)
- `limit`: عدد النتائج (default: 100)
- `search`: نص البحث
- `sort`: ترتيب النتائج (-totalScore للتنازلي)

**Response:**
```json
{
  "data": [...],
  "total": 10,
  "page": 1,
  "limit": 100,
  "table": "players",
  "schema": {...}
}
```

#### 2. Get Player
```http
GET /tables/players/{id}
```

**Response:**
```json
{
  "id": "uuid",
  "teamName": "Team A",
  "email": "team@example.com",
  ...
}
```

#### 3. Create Player
```http
POST /tables/players
Content-Type: application/json

{
  "teamName": "Team A",
  "email": "team@example.com",
  "currentStage": 1,
  "totalScore": 0,
  "completedStages": [],
  "stageScores": "{}",
  "treasureClues": [],
  "isWinner": false
}
```

**Response:** HTTP 201 Created

#### 4. Update Player (Full)
```http
PUT /tables/players/{id}
Content-Type: application/json

{
  "teamName": "Team A Updated",
  "email": "team@example.com",
  "currentStage": 5,
  "totalScore": 500,
  ...
}
```

#### 5. Update Player (Partial)
```http
PATCH /tables/players/{id}
Content-Type: application/json

{
  "totalScore": 500,
  "completedStages": [1, 2, 3]
}
```

#### 6. Delete Player
```http
DELETE /tables/players/{id}
```

**Response:** HTTP 204 No Content

### Error Handling
```javascript
// All API calls should handle errors
try {
  const response = await fetch('tables/players');
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  const data = await response.json();
} catch (error) {
  console.error('API Error:', error);
  showNotification('حدث خطأ في الاتصال', 'error');
}
```

---

## 📁 الملفات والوحدات

### 1. `index.html`
**المسؤولية**: هيكل الصفحة الرئيسية

**Screens:**
- `loginScreen`: شاشة تسجيل الدخول
- `stageSelectionScreen`: اختيار المراحل
- `quizScreen`: شاشة الأسئلة
- `marioScreen`: لعبة الروبوت
- `labScreen`: المختبر الكيميائي
- `treasureScreen`: البحث عن الكنز
- `victoryScreen`: شاشة الفوز
- `leaderboardScreen`: لوحة المتصدرين
- `adminScreen`: لوحة الأدمن

### 2. `css/style.css`
**المسؤولية**: جميع التنسيقات

**CSS Variables:**
```css
:root {
  --primary-green: #00ff88;
  --primary-orange: #ff6b35;
  --dark-bg: #0a0e27;
  --darker-bg: #060816;
  --card-bg: #151932;
  --hover-bg: #1e2444;
  ...
}
```

**Major Components:**
- Global styles
- Background animations
- Screen transitions
- Button styles
- Form styles
- Game-specific styles
- Responsive design

### 3. `js/main.js`
**المسؤولية**: الوظائف الرئيسية وإدارة الحالة

**Global Variables:**
```javascript
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
```

**Key Functions:**
- `startGame()`: بدء اللعبة/تسجيل الدخول
- `logout()`: تسجيل الخروج
- `showScreen(screenId)`: التنقل بين الشاشات
- `updatePlayerDisplay()`: تحديث عرض اللاعب
- `updateStageCards()`: تحديث بطاقات المراحل
- `saveProgress()`: حفظ التقدم
- `loadPlayerProgress()`: تحميل التقدم
- `startStage(stageNum)`: بدء مرحلة
- `showLeaderboard()`: عرض لوحة المتصدرين
- `showVictory()`: عرض شاشة الفوز

### 4. `js/quiz.js`
**المسؤولية**: نظام الأسئلة

**Key Variables:**
```javascript
let currentQuestions = [];
let currentQuestionIndex = 0;
let quizScore = 0;
let answeredQuestions = 0;
```

**Key Functions:**
- `initQuiz(stageNum)`: تهيئة نظام الأسئلة
- `showQuestion()`: عرض سؤال
- `checkAnswer(selectedAnswer, question)`: التحقق من الإجابة
- `nextQuestion()`: السؤال التالي
- `completeQuiz()`: إنهاء المرحلة
- `createSampleQuestions(stageNum)`: إنشاء أسئلة نموذجية

### 5. `js/mario.js`
**المسؤولية**: لعبة الروبوت

**Game Objects:**
```javascript
{
  player: {x, y, width, height, velocityY, velocityX, ...},
  platforms: [{x, y, width, height, color}, ...],
  obstacles: [{x, y, width, height, color}, ...],
  coins: [{x, y, width, height, collected}, ...],
  door: {x, y, width, height, visible, color}
}
```

**Game Loop:**
```javascript
function gameLoop() {
  // 1. Clear canvas
  // 2. Update physics
  // 3. Check collisions
  // 4. Draw everything
  // 5. Request next frame
  requestAnimationFrame(gameLoop);
}
```

**Key Functions:**
- `initMarioGame()`: تهيئة اللعبة
- `checkStartCode()`: التحقق من كود البداية
- `startMarioGame()`: بدء اللعبة
- `setupControls()`: إعداد التحكم بالمفاتيح
- `gameLoop()`: حلقة اللعبة الرئيسية
- `checkCollision(obj1, obj2)`: كشف التصادم
- `checkDoorCode()`: التحقق من كود الباب
- `completeMarioGame()`: إكمال اللعبة

### 6. `js/lab.js`
**المسؤولية**: المختبر الكيميائي

**Lab State:**
```javascript
let selectedChemicals = [];
let attemptsLeft = 5;
const correctMixture = ['B', 'C', 'E'];
```

**Key Functions:**
- `initLab()`: تهيئة المختبر
- `selectChemical(chemical)`: اختيار مادة كيميائية
- `updateMixtureDisplay()`: تحديث عرض المزيج
- `clearMixture()`: إعادة تعيين المزيج
- `testMixture()`: اختبار المزيج
- `showMixtureFeedback()`: عرض التغذية الراجعة
- `completeLabStage()`: إكمال المرحلة

### 7. `js/treasure.js`
**المسؤولية**: البحث عن الكنز

**Key Functions:**
- `initTreasureHunt()`: تهيئة مرحلة الكنز
- `displayClues()`: عرض الأدلة المجمعة
- `unlockTreasure()`: فتح الكنز
- `completeTreasureHunt()`: إكمال المرحلة

**Treasure Code:**
```javascript
const correctCode = 'B7X3C9R1E5S2T8A4G6E0'; // 20 characters
```

### 8. `js/admin.js`
**المسؤولية**: لوحة تحكم الأدمن

**Key Functions:**
- `loadAdminData()`: تحميل بيانات الأدمن
- `loadAllPlayers()`: تحميل جميع اللاعبين
- `loadAllQuestions()`: تحميل جميع الأسئلة
- `updateAdminStats()`: تحديث الإحصائيات
- `displayAdminPlayers()`: عرض اللاعبين
- `displayAdminQuestions()`: عرض الأسئلة
- `deletePlayer(playerId)`: حذف لاعب
- `deleteQuestion(questionId)`: حذف سؤال
- `showAdminTab(tabName)`: التبديل بين التبويبات
- `showAddQuestion()`: عرض نموذج إضافة سؤال
- `submitNewQuestion()`: إضافة سؤال جديد
- `resetAllData()`: إعادة تعيين البيانات
- `exportData()`: تصدير البيانات

---

## 🔄 تدفق العمل

### 1. User Login Flow
```
User enters credentials
  ↓
Check if admin email
  ↓ No
Search for existing player by email
  ↓
Found? → Load player data
  ↓ Not found
Create new player record
  ↓
Save to localStorage
  ↓
Show stage selection screen
```

### 2. Quiz Stage Flow
```
User clicks stage button
  ↓
Load questions for stage from database
  ↓
Shuffle questions
  ↓
Show first question
  ↓
User selects answer
  ↓
Check if correct
  ↓ Correct
Award points + Add clue
  ↓
Show next question
  ↓
All questions answered?
  ↓ Yes
Update gameState
  ↓
Save progress to database
  ↓
Show completion screen
```

### 3. Mario Game Flow
```
User starts stage 3
  ↓
Show code challenge 1
  ↓
User fixes code (5, 15, 0.8)
  ↓ Correct
Initialize game
  ↓
Game loop starts
  ↓
User collects all coins
  ↓
Show code challenge 2
  ↓
User fixes code (BLAXX, ROBOT)
  ↓ Correct
Door appears
  ↓
User reaches door
  ↓
Calculate score
  ↓
Save progress
  ↓
Show completion
```

### 4. Lab Flow
```
User starts stage 6
  ↓
Select 3 chemicals
  ↓
Test mixture
  ↓
Correct? → Award points based on attempts
  ↓ Wrong
Attempts left? → Try again with feedback
  ↓ No attempts
Show failure screen with option to retry
```

### 5. Treasure Hunt Flow
```
User completes stages 1-9
  ↓
Stage 10 unlocks
  ↓
Display all collected clues
  ↓
User enters 20-character code
  ↓
Validate code
  ↓ Correct
Award 300 points
  ↓
Check if all 10 stages complete
  ↓ Yes
Show victory screen with trophy
```

---

## 💾 التخزين المحلي

### localStorage Structure
```javascript
{
  "currentPlayer": {
    "teamName": "Team A",
    "email": "team@example.com",
    "totalScore": 450,
    "completedStages": [1, 2, 3],
    "stageScores": {"1": 100, "2": 100, "3": 150},
    "treasureClues": ["B", "7", "X", ...],
    "currentStageId": "uuid"
  }
}
```

### Sync Strategy
```javascript
// Save to localStorage immediately
localStorage.setItem('currentPlayer', JSON.stringify(gameState));

// Save to database asynchronously
await fetch(`tables/players/${gameState.currentStageId}`, {
  method: 'PATCH',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify(updateData)
});
```

---

## 🔒 الأمان

### Current Implementation
- ✅ Client-side validation
- ✅ Admin email check
- ✅ Soft delete (deleted flag)
- ✅ Input sanitization (basic)

### Security Considerations
```javascript
// Admin check
if (email === 'lamisfo733@gmail.com') {
  showScreen('adminScreen');
  loadAdminData();
  return;
}

// Email validation
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
  alert('بريد إلكتروني غير صحيح');
  return;
}
```

### Recommended Improvements
- [ ] Server-side validation
- [ ] Rate limiting for API calls
- [ ] CSRF protection
- [ ] Input sanitization (XSS prevention)
- [ ] SQL injection prevention (if using SQL)
- [ ] Authentication tokens
- [ ] Password hashing for admin

---

## 🚀 التحسينات المستقبلية

### Performance
```javascript
// 1. Lazy loading images
const img = new Image();
img.loading = 'lazy';

// 2. Debouncing API calls
const debouncedSave = debounce(saveProgress, 1000);

// 3. Virtual scrolling for large lists
// Implement virtual list for leaderboard

// 4. Code splitting
// Split JS into chunks for faster initial load
```

### Features
```javascript
// 1. Multiplayer support
// WebSocket connection for real-time updates

// 2. Achievement system
const achievements = {
  'speedrunner': { condition: time < 600, reward: 50 },
  'perfectionist': { condition: totalScore === 1250, reward: 100 }
};

// 3. Difficulty levels
const difficulties = {
  easy: { questionTime: 60, livesMultiplier: 1.5 },
  medium: { questionTime: 30, livesMultiplier: 1 },
  hard: { questionTime: 15, livesMultiplier: 0.5 }
};

// 4. Social features
// Share scores on social media
// Team leaderboards
```

### Testing
```javascript
// Unit tests
describe('Quiz System', () => {
  it('should award points for correct answers', () => {
    const result = checkAnswer('correct', question);
    expect(result.points).toBe(10);
  });
});

// Integration tests
describe('Player Flow', () => {
  it('should save progress after completing stage', async () => {
    await completeQuiz();
    const saved = await loadPlayerProgress();
    expect(saved.completedStages).toContain(1);
  });
});
```

---

## 📊 Performance Metrics

### Target Metrics
```javascript
const performanceTargets = {
  firstContentfulPaint: '< 1s',
  timeToInteractive: '< 2s',
  totalPageSize: '< 500KB',
  apiResponseTime: '< 200ms',
  gameFrameRate: '60 FPS'
};
```

### Monitoring
```javascript
// Performance API
window.addEventListener('load', () => {
  const perfData = performance.getEntriesByType('navigation')[0];
  console.log('Page load time:', perfData.loadEventEnd - perfData.fetchStart);
});

// Game FPS monitoring
let lastTime = 0;
let frameCount = 0;
let fps = 0;

function gameLoop(currentTime) {
  frameCount++;
  if (currentTime - lastTime >= 1000) {
    fps = frameCount;
    frameCount = 0;
    lastTime = currentTime;
    console.log('FPS:', fps);
  }
  requestAnimationFrame(gameLoop);
}
```

---

## 🐛 Debugging

### Console Logging
```javascript
// Enable debug mode
const DEBUG = true;

function debugLog(category, message, data) {
  if (DEBUG) {
    console.log(`[${category}]`, message, data);
  }
}

// Usage
debugLog('QUIZ', 'Question loaded', currentQuestion);
debugLog('GAME', 'Collision detected', {player, obstacle});
```

### Common Issues

#### Issue: Progress not saving
```javascript
// Check 1: Network connectivity
navigator.onLine // true/false

// Check 2: API response
const response = await fetch('tables/players/id');
console.log('Status:', response.status);

// Check 3: localStorage
console.log(localStorage.getItem('currentPlayer'));
```

#### Issue: Game lag
```javascript
// Check 1: Frame rate
console.log('FPS:', fps);

// Check 2: Canvas size
console.log('Canvas:', canvas.width, canvas.height);

// Fix: Reduce canvas size or simplify graphics
canvas.width = Math.min(800, window.innerWidth);
```

---

## 📝 Code Style Guide

### JavaScript
```javascript
// Use camelCase for variables and functions
const playerScore = 100;
function calculateTotal() {}

// Use PascalCase for classes
class GameManager {}

// Use UPPER_CASE for constants
const MAX_ATTEMPTS = 5;
const CORRECT_MIXTURE = ['B', 'C', 'E'];

// Async/await for promises
async function loadData() {
  try {
    const data = await fetch('api/endpoint');
    return data.json();
  } catch (error) {
    console.error(error);
  }
}
```

### CSS
```css
/* Use kebab-case for classes */
.stage-card {}
.quiz-container {}

/* Use BEM methodology for complex components */
.stage-card__title {}
.stage-card__title--highlighted {}

/* Group related properties */
.element {
  /* Positioning */
  position: relative;
  top: 0;
  
  /* Box model */
  width: 100%;
  padding: 20px;
  
  /* Visual */
  background: #fff;
  color: #000;
  
  /* Typography */
  font-size: 16px;
  line-height: 1.5;
  
  /* Other */
  cursor: pointer;
}
```

---

## 📞 Support

للأسئلة التقنية أو المساهمة في التطوير:
- 📧 Email: lamisfo733@gmail.com
- 📂 Repository: [Link to repo]

---

**Version**: 1.0.0  
**Last Updated**: 2025-12-11  
**Maintained By**: Team Blaxx
