// UI Controller
class UIController {
    constructor() {
        this.screens = {
            start: document.getElementById('start-screen'),
            game: document.getElementById('game-screen'),
            result: document.getElementById('result-screen'),
            gameover: document.getElementById('gameover-screen')
        };

        this.elements = {
            // Start screen
            startBtn: document.getElementById('start-btn'),
            highScoreValue: document.getElementById('high-score-value'),

            // Game screen
            canvas: document.getElementById('game-canvas'),
            levelText: document.getElementById('level-text'),
            fruitName: document.getElementById('fruit-name'),
            timeValue: document.getElementById('time-value'),
            cutsValue: document.getElementById('cuts-value'),
            scoreValue: document.getElementById('score-value'),
            timer: document.getElementById('timer'),
            instruction: document.getElementById('instruction'),

            // Result screen
            resultTitle: document.getElementById('result-title'),
            leftPercentage: document.getElementById('left-percentage'),
            rightPercentage: document.getElementById('right-percentage'),
            deviation: document.getElementById('deviation'),
            resultScore: document.getElementById('result-score'),
            resultMessage: document.getElementById('result-message'),
            nextLevelBtn: document.getElementById('next-level-btn'),
            retryBtn: document.getElementById('retry-btn'),
            menuBtn: document.getElementById('menu-btn'),

            // Gameover screen
            gameoverMessage: document.getElementById('gameover-message'),
            finalScoreValue: document.getElementById('final-score-value'),
            restartBtn: document.getElementById('restart-btn')
        };

        this.ctx = this.elements.canvas.getContext('2d');
        this.setupCanvas();
    }

    setupCanvas() {
        const container = this.elements.canvas.parentElement;
        const ui = document.getElementById('game-ui');
        const instruction = this.elements.instruction;

        this.resizeFunction = () => {
            const containerHeight = container.clientHeight;
            const uiHeight = ui.offsetHeight;
            const instructionHeight = instruction.offsetHeight;
            const availableHeight = containerHeight - uiHeight - instructionHeight;

            this.elements.canvas.width = container.clientWidth;
            this.elements.canvas.height = availableHeight;
        };

        this.resizeFunction();
        window.addEventListener('resize', this.resizeFunction);
    }

    resizeCanvas() {
        if (this.resizeFunction) {
            this.resizeFunction();
        }
    }

    showScreen(screenName) {
        Object.values(this.screens).forEach(screen => {
            screen.classList.remove('active');
        });
        if (this.screens[screenName]) {
            this.screens[screenName].classList.add('active');
        }
    }

    updateLevelInfo(level, totalLevels, fruitName) {
        this.elements.levelText.textContent = `第 ${level} 关 / ${totalLevels}`;
        this.elements.fruitName.textContent = fruitName;
    }

    updateTimer(seconds) {
        this.elements.timeValue.textContent = seconds;

        // Warning animation when time is low
        if (seconds <= 5) {
            this.elements.timer.classList.add('warning');
        } else {
            this.elements.timer.classList.remove('warning');
        }
    }

    updateCutsRemaining(cuts) {
        this.elements.cutsValue.textContent = cuts;
    }

    updateScore(score) {
        this.elements.scoreValue.textContent = score;
    }

    updateHighScore(score) {
        this.elements.highScoreValue.textContent = score;
    }

    showResult(splitResult, score, grade, message, hasNextLevel) {
        this.elements.leftPercentage.textContent = splitResult.left.toFixed(1) + '%';
        this.elements.rightPercentage.textContent = splitResult.right.toFixed(1) + '%';
        this.elements.deviation.textContent = splitResult.deviation.toFixed(1) + '%';
        this.elements.resultScore.textContent = score;
        this.elements.resultMessage.textContent = message;

        // Set message color based on grade
        this.elements.resultMessage.className = grade;

        // Show/hide next level button
        if (hasNextLevel) {
            this.elements.nextLevelBtn.style.display = 'inline-block';
        } else {
            this.elements.nextLevelBtn.style.display = 'none';
        }

        this.showScreen('result');
    }

    showGameOver(totalScore, highScore, level) {
        if (level > 15) {
            this.elements.gameoverMessage.textContent = `恭喜！你完成了所有 ${level - 1} 关！`;
        } else {
            this.elements.gameoverMessage.textContent = `你到达了第 ${level} 关`;
        }
        this.elements.finalScoreValue.textContent = totalScore;
        this.showScreen('gameover');
    }

    setInstruction(text) {
        this.elements.instruction.textContent = text;
    }

    clearCanvas() {
        this.ctx.clearRect(0, 0, this.elements.canvas.width, this.elements.canvas.height);
    }

    getCanvasSize() {
        return {
            width: this.elements.canvas.width,
            height: this.elements.canvas.height
        };
    }

    getCanvasContext() {
        return this.ctx;
    }

    // Button event listeners
    onStartClick(callback) {
        this.elements.startBtn.addEventListener('click', callback);
    }

    onNextLevelClick(callback) {
        this.elements.nextLevelBtn.addEventListener('click', callback);
    }

    onRetryClick(callback) {
        this.elements.retryBtn.addEventListener('click', callback);
    }

    onMenuClick(callback) {
        this.elements.menuBtn.addEventListener('click', callback);
    }

    onRestartClick(callback) {
        this.elements.restartBtn.addEventListener('click', callback);
    }

    // Canvas mouse/touch events
    onCanvasMouseDown(callback) {
        this.elements.canvas.addEventListener('mousedown', (e) => {
            const rect = this.elements.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            callback(x, y);
        });
    }

    onCanvasMouseMove(callback) {
        this.elements.canvas.addEventListener('mousemove', (e) => {
            const rect = this.elements.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            callback(x, y);
        });
    }

    onCanvasMouseUp(callback) {
        this.elements.canvas.addEventListener('mouseup', (e) => {
            const rect = this.elements.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            callback(x, y);
        });
    }

    // Touch support
    onCanvasTouchStart(callback) {
        this.elements.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const rect = this.elements.canvas.getBoundingClientRect();
            const touch = e.touches[0];
            const x = touch.clientX - rect.left;
            const y = touch.clientY - rect.top;
            callback(x, y);
        });
    }

    onCanvasTouchMove(callback) {
        this.elements.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const rect = this.elements.canvas.getBoundingClientRect();
            const touch = e.touches[0];
            const x = touch.clientX - rect.left;
            const y = touch.clientY - rect.top;
            callback(x, y);
        });
    }

    onCanvasTouchEnd(callback) {
        this.elements.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            callback();
        });
    }

    setCanvasCursor(cursorType) {
        this.elements.canvas.style.cursor = cursorType;
    }

    addCanvasClass(className) {
        this.elements.canvas.classList.add(className);
    }

    removeCanvasClass(className) {
        this.elements.canvas.classList.remove(className);
    }

    // Particle effects for perfect cuts
    createParticleEffect(x, y, color = '#ffd700') {
        const particles = [];
        const particleCount = 20;

        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 / particleCount) * i;
            const speed = 2 + Math.random() * 3;
            particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 30,
                maxLife: 30,
                color: color,
                size: 3 + Math.random() * 3
            });
        }

        return particles;
    }

    updateAndDrawParticles(particles) {
        const ctx = this.ctx;
        particles.forEach((particle, index) => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life--;

            const alpha = particle.life / particle.maxLife;
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.fillStyle = particle.color;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();

            if (particle.life <= 0) {
                particles.splice(index, 1);
            }
        });
    }

    // Score popup animation
    showScorePopup(score, x, y) {
        const popup = document.createElement('div');
        popup.textContent = '+' + score;
        popup.style.position = 'fixed';
        popup.style.left = x + 'px';
        popup.style.top = y + 'px';
        popup.style.fontSize = '48px';
        popup.style.fontWeight = 'bold';
        popup.style.color = '#ffd700';
        popup.style.textShadow = '2px 2px 4px rgba(0,0,0,0.5)';
        popup.style.pointerEvents = 'none';
        popup.style.zIndex = '1000';
        popup.style.animation = 'float-up 1s ease-out forwards';

        document.body.appendChild(popup);

        setTimeout(() => {
            popup.remove();
        }, 1000);
    }
}

// Add CSS animation for score popup
const style = document.createElement('style');
style.textContent = `
    @keyframes float-up {
        0% {
            opacity: 1;
            transform: translateY(0);
        }
        100% {
            opacity: 0;
            transform: translateY(-100px);
        }
    }
`;
document.head.appendChild(style);
