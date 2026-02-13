// Game states
const GameState = {
    START: 'start',
    PLAYING: 'playing',
    CUTTING: 'cutting',
    ANIMATING: 'animating',
    RESULT: 'result',
    GAMEOVER: 'gameover'
};

// Main Game class
class Game {
    constructor() {
        this.ui = new UIController();
        this.levelManager = new LevelManager();
        this.slicer = new Slicer();

        this.state = GameState.START;
        this.currentShape = null;
        this.currentLine = null;
        this.cutsRemaining = 0;
        this.timeRemaining = 0;
        this.timer = null;
        this.totalScore = 0;
        this.highScore = this.loadHighScore();
        this.splitAnimation = null;
        this.particles = [];

        this.setupEventListeners();
        this.ui.updateHighScore(this.highScore);
    }

    setupEventListeners() {
        // Button clicks
        this.ui.onStartClick(() => this.startGame());
        this.ui.onNextLevelClick(() => this.nextLevel());
        this.ui.onRetryClick(() => this.retryLevel());
        this.ui.onMenuClick(() => this.returnToMenu());
        this.ui.onRestartClick(() => this.restartGame());

        // Canvas mouse events
        this.ui.onCanvasMouseDown((x, y) => this.handleMouseDown(x, y));
        this.ui.onCanvasMouseMove((x, y) => this.handleMouseMove(x, y));
        this.ui.onCanvasMouseUp((x, y) => this.handleMouseUp(x, y));

        // Canvas touch events
        this.ui.onCanvasTouchStart((x, y) => this.handleMouseDown(x, y));
        this.ui.onCanvasTouchMove((x, y) => this.handleMouseMove(x, y));
        this.ui.onCanvasTouchEnd(() => this.handleMouseUp(0, 0));
    }

    startGame() {
        this.totalScore = 0;
        this.levelManager.resetToLevel(1);
        this.startLevel();
    }

    startLevel() {
        const levelConfig = this.levelManager.getCurrentLevel();

        // Show game screen first so canvas has proper dimensions
        this.ui.showScreen('game');

        // Small delay to ensure screen is visible and canvas is sized
        setTimeout(() => {
            // Resize canvas after screen is shown
            this.ui.resizeCanvas();

            const canvasSize = this.ui.getCanvasSize();

            this.currentShape = this.levelManager.createShapeForLevel(
                canvasSize.width,
                canvasSize.height,
                levelConfig
            );

            this.cutsRemaining = levelConfig.cutsAllowed;
            this.timeRemaining = levelConfig.timeLimit;
            this.currentLine = null;
            this.splitAnimation = null;
            this.particles = [];

            const fruitName = this.levelManager.getFruitName(levelConfig.fruit);
            this.ui.updateLevelInfo(
                levelConfig.level,
                this.levelManager.getTotalLevels(),
                fruitName
            );
            this.ui.updateScore(this.totalScore);
            this.ui.updateCutsRemaining(this.cutsRemaining);
            this.ui.updateTimer(this.timeRemaining);
            this.ui.setInstruction('按住鼠标拖拽画线切割水果');

            this.state = GameState.PLAYING;

            this.startTimer();
            this.render();
        }, 10);
    }

    startTimer() {
        this.stopTimer();
        this.timer = setInterval(() => {
            this.timeRemaining--;
            this.ui.updateTimer(this.timeRemaining);

            if (this.timeRemaining <= 0) {
                this.stopTimer();
                this.gameOver('时间到！');
            }
        }, 1000);
    }

    stopTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    handleMouseDown(x, y) {
        if (this.state !== GameState.PLAYING) return;

        this.currentLine = new SliceLine(x, y);
        this.state = GameState.CUTTING;
        this.ui.addCanvasClass('drawing');
    }

    handleMouseMove(x, y) {
        if (this.state !== GameState.CUTTING || !this.currentLine) return;

        this.currentLine.updateEnd(x, y);
    }

    handleMouseUp(x, y) {
        if (this.state !== GameState.CUTTING || !this.currentLine) return;

        this.ui.removeCanvasClass('drawing');

        // Check if line is long enough
        if (this.currentLine.getLength() < 20) {
            this.currentLine = null;
            this.state = GameState.PLAYING;
            return;
        }

        // Check if line intersects shape
        if (!this.currentLine.intersectsShape(this.currentShape)) {
            this.ui.setInstruction('切割线必须穿过水果！');
            this.currentLine = null;
            this.state = GameState.PLAYING;
            setTimeout(() => {
                if (this.state === GameState.PLAYING) {
                    this.ui.setInstruction('按住鼠标拖拽画线切割水果');
                }
            }, 2000);
            return;
        }

        // Calculate split
        const splitResult = this.slicer.calculateSplit(this.currentShape, this.currentLine);

        if (!splitResult) {
            this.ui.setInstruction('切割失败，请重试！');
            this.currentLine = null;
            this.state = GameState.PLAYING;
            setTimeout(() => {
                if (this.state === GameState.PLAYING) {
                    this.ui.setInstruction('按住鼠标拖拽画线切割水果');
                }
            }, 2000);
            return;
        }

        // Successful cut
        this.cutsRemaining--;
        this.ui.updateCutsRemaining(this.cutsRemaining);

        // Create split animation
        this.splitAnimation = this.slicer.createSplitAnimation(this.currentShape, this.currentLine);
        this.state = GameState.ANIMATING;

        // Create particles for perfect cuts
        const levelConfig = this.levelManager.getCurrentLevel();
        if (splitResult.deviation <= levelConfig.perfectRange) {
            this.particles = this.ui.createParticleEffect(
                this.currentShape.x,
                this.currentShape.y,
                '#ffd700'
            );
        }

        // Wait for animation to complete
        setTimeout(() => {
            this.processResult(splitResult);
        }, 1000);
    }

    processResult(splitResult) {
        this.stopTimer();

        const levelConfig = this.levelManager.getCurrentLevel();

        // Calculate time bonus
        const timeRatio = this.timeRemaining / levelConfig.timeLimit;
        const timeBonus = Math.round(timeRatio * 10);

        // Calculate score
        const score = this.slicer.calculateScore(
            splitResult.deviation,
            levelConfig.perfectRange,
            levelConfig.goodRange,
            timeBonus
        );

        this.totalScore += score;
        this.ui.updateScore(this.totalScore);

        // Update high score
        if (this.totalScore > this.highScore) {
            this.highScore = this.totalScore;
            this.saveHighScore(this.highScore);
            this.ui.updateHighScore(this.highScore);
        }

        // Get result grade and message
        const grade = this.slicer.getResultGrade(
            splitResult.deviation,
            levelConfig.perfectRange,
            levelConfig.goodRange
        );
        const message = this.slicer.getResultMessage(grade);

        // Check if can proceed to next level
        const canProceed = score >= levelConfig.targetScore;
        const hasNextLevel = this.levelManager.currentLevel < this.levelManager.getTotalLevels();

        this.state = GameState.RESULT;
        this.ui.showResult(splitResult, score, grade, message, canProceed && hasNextLevel);
    }

    nextLevel() {
        if (this.levelManager.nextLevel()) {
            this.startLevel();
        } else {
            this.gameOver('恭喜完成所有关卡！');
        }
    }

    retryLevel() {
        this.startLevel();
    }

    returnToMenu() {
        this.stopTimer();
        this.state = GameState.START;
        this.ui.showScreen('start');
    }

    restartGame() {
        this.startGame();
    }

    gameOver(message) {
        this.stopTimer();
        this.state = GameState.GAMEOVER;
        this.ui.showGameOver(
            this.totalScore,
            this.highScore,
            this.levelManager.currentLevel
        );
    }

    render() {
        if (this.state === GameState.START || this.state === GameState.RESULT || this.state === GameState.GAMEOVER) {
            return;
        }

        const ctx = this.ui.getCanvasContext();
        this.ui.clearCanvas();

        // Draw shape
        if (this.currentShape) {
            if (this.state === GameState.ANIMATING && this.splitAnimation) {
                // Draw split visualization during animation
                if (this.currentLine) {
                    const splitResult = this.slicer.calculateSplit(this.currentShape, this.currentLine);
                    if (splitResult) {
                        this.slicer.visualizeSplit(ctx, this.currentShape, this.currentLine, splitResult);
                    }
                }

                // Update animation
                this.splitAnimation.update();
            } else {
                // Normal shape drawing
                this.currentShape.draw(ctx);
            }
        }

        // Draw current cutting line
        if (this.state === GameState.CUTTING && this.currentLine) {
            this.currentLine.draw(ctx);
        }

        // Draw particles
        if (this.particles.length > 0) {
            this.ui.updateAndDrawParticles(this.particles);
        }

        requestAnimationFrame(() => this.render());
    }

    // Local storage for high score
    saveHighScore(score) {
        try {
            localStorage.setItem('fruitSliceHighScore', score.toString());
        } catch (e) {
            console.error('Failed to save high score:', e);
        }
    }

    loadHighScore() {
        try {
            const score = localStorage.getItem('fruitSliceHighScore');
            return score ? parseInt(score, 10) : 0;
        } catch (e) {
            console.error('Failed to load high score:', e);
            return 0;
        }
    }
}

// Initialize game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
    console.log('🍉 水果切割游戏已加载！');
});
