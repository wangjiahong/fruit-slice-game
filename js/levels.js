// Level configuration and management
class LevelManager {
    constructor() {
        this.currentLevel = 1;
        this.levels = this.createLevels();
    }

    createLevels() {
        const levels = [];

        // Level 1: 圆形 - 西瓜
        levels.push({
            level: 1,
            shape: 'circle',
            fruit: 'watermelon',
            difficulty: 'easy',
            timeLimit: 40,
            cutsAllowed: 1,
            perfectRange: 3,
            goodRange: 6,
            targetScore: 0,
            rotation: 0
        });

        // Level 2: 椭圆 - 橙子
        levels.push({
            level: 2,
            shape: 'ellipse',
            fruit: 'orange',
            difficulty: 'medium',
            timeLimit: 35,
            cutsAllowed: 1,
            perfectRange: 2.5,
            goodRange: 5.5,
            targetScore: 0,
            rotation: Math.PI / 4
        });

        // Level 3: 多边形 - 柠檬
        levels.push({
            level: 3,
            shape: 'polygon',
            fruit: 'lemon',
            difficulty: 'hard',
            timeLimit: 30,
            cutsAllowed: 1,
            perfectRange: 2,
            goodRange: 5,
            targetScore: 0,
            rotation: 0
        });

        // Level 4: 星形 - 苹果
        levels.push({
            level: 4,
            shape: 'star',
            fruit: 'apple',
            difficulty: 'expert',
            timeLimit: 25,
            cutsAllowed: 1,
            perfectRange: 1.5,
            goodRange: 4,
            targetScore: 0,
            rotation: 0
        });

        return levels;
    }

    getCurrentLevel() {
        return this.levels[this.currentLevel - 1] || this.levels[this.levels.length - 1];
    }

    nextLevel() {
        if (this.currentLevel < this.levels.length) {
            this.currentLevel++;
            return true;
        }
        return false;
    }

    resetToLevel(level) {
        this.currentLevel = Math.max(1, Math.min(level, this.levels.length));
    }

    getTotalLevels() {
        return this.levels.length;
    }

    createShapeForLevel(canvasWidth, canvasHeight, levelConfig) {
        const centerX = canvasWidth / 2;
        const centerY = canvasHeight / 2;

        // Mobile: larger fruit size to fill more space and reduce empty area
        const isMobile = window.innerWidth <= 768;
        const sizeMultiplier = isMobile ? 0.55 : 0.3;
        const baseSize = Math.min(canvasWidth, canvasHeight) * sizeMultiplier;

        switch(levelConfig.shape) {
            case 'circle':
                return new CircleShape(centerX, centerY, baseSize * 0.8, levelConfig.fruit);

            case 'ellipse':
                return new EllipseShape(
                    centerX,
                    centerY,
                    baseSize * 0.9,
                    baseSize * 0.6,
                    levelConfig.rotation,
                    levelConfig.fruit
                );

            case 'polygon':
                // Create irregular polygon
                const vertices = this.createIrregularPolygon(baseSize * 0.7, levelConfig.level);
                return new PolygonShape(centerX, centerY, vertices, levelConfig.fruit);

            case 'star':
                return new StarShape(
                    centerX,
                    centerY,
                    baseSize * 0.8,
                    baseSize * 0.4,
                    5,
                    levelConfig.fruit
                );

            default:
                return new CircleShape(centerX, centerY, baseSize * 0.8, levelConfig.fruit);
        }
    }

    createIrregularPolygon(baseRadius, seed) {
        const sides = 6 + (seed % 3); // 6-8 sides
        const vertices = [];

        // Use seed for consistent randomness per level
        const seededRandom = (index) => {
            const x = Math.sin(seed * 12.9898 + index * 78.233) * 43758.5453;
            return x - Math.floor(x);
        };

        for (let i = 0; i < sides; i++) {
            const angle = (Math.PI * 2 / sides) * i;
            const randomFactor = 0.7 + seededRandom(i) * 0.6; // 0.7 to 1.3
            const radius = baseRadius * randomFactor;
            vertices.push({
                x: Math.cos(angle) * radius,
                y: Math.sin(angle) * radius
            });
        }

        return vertices;
    }

    getFruitName(fruitType) {
        const names = {
            'watermelon': '西瓜',
            'orange': '橙子',
            'lemon': '柠檬',
            'apple': '苹果'
        };
        return names[fruitType] || '水果';
    }

    getDifficultyName(difficulty) {
        const names = {
            'easy': '简单',
            'medium': '中等',
            'hard': '困难',
            'expert': '专家',
            'master': '大师'
        };
        return names[difficulty] || '';
    }
}
