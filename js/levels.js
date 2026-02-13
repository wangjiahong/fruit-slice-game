// Level configuration and management
class LevelManager {
    constructor() {
        this.currentLevel = 1;
        this.levels = this.createLevels();
    }

    createLevels() {
        const levels = [];
        const fruits = ['watermelon', 'orange', 'lemon', 'apple'];
        let fruitIndex = 0;

        // 第1关：对称圆形（简单入门）
        levels.push({
            level: 1,
            shape: 'circle',
            fruit: fruits[fruitIndex++],
            difficulty: 'easy',
            timeLimit: 40,
            cutsAllowed: 1,
            perfectRange: 3,
            goodRange: 6,
            targetScore: 0,
            rotation: 0
        });

        // 第2-15关：全部不对称图形
        const asymmetricShapes = [
            { shape: 'polygon', seed: 2, difficulty: 'easy', timeLimit: 38 },
            { shape: 'polygon', seed: 3, difficulty: 'easy', timeLimit: 36 },
            { shape: 'polygon', seed: 4, difficulty: 'medium', timeLimit: 34 },
            { shape: 'polygon', seed: 5, difficulty: 'medium', timeLimit: 32 },
            { shape: 'polygon', seed: 6, difficulty: 'medium', timeLimit: 30 },
            { shape: 'polygon', seed: 7, difficulty: 'medium', timeLimit: 28 },
            { shape: 'polygon', seed: 8, difficulty: 'hard', timeLimit: 26 },
            { shape: 'polygon', seed: 9, difficulty: 'hard', timeLimit: 24 },
            { shape: 'polygon', seed: 10, difficulty: 'hard', timeLimit: 22 },
            { shape: 'polygon', seed: 11, difficulty: 'hard', timeLimit: 20 },
            { shape: 'polygon', seed: 12, difficulty: 'expert', timeLimit: 18 },
            { shape: 'polygon', seed: 13, difficulty: 'expert', timeLimit: 16 },
            { shape: 'polygon', seed: 14, difficulty: 'expert', timeLimit: 14 },
            { shape: 'polygon', seed: 15, difficulty: 'expert', timeLimit: 12 }
        ];

        asymmetricShapes.forEach((config, index) => {
            levels.push({
                level: index + 2,
                shape: config.shape,
                fruit: fruits[fruitIndex % fruits.length],
                difficulty: config.difficulty,
                timeLimit: config.timeLimit,
                cutsAllowed: 1,
                perfectRange: 2.8 - (index * 0.12),
                goodRange: 5.8 - (index * 0.15),
                targetScore: 0,
                rotation: 0,
                seed: config.seed
            });
            fruitIndex++;
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
                    baseSize * (levelConfig.radiusX || 0.9),
                    baseSize * (levelConfig.radiusY || 0.6),
                    levelConfig.rotation,
                    levelConfig.fruit
                );

            case 'triangle':
                return new PolygonShape(centerX, centerY, this.createRegularPolygon(baseSize * 0.8, 3), levelConfig.fruit);

            case 'square':
                return new PolygonShape(centerX, centerY, this.createRegularPolygon(baseSize * 0.7, 4), levelConfig.fruit);

            case 'pentagon':
                return new PolygonShape(centerX, centerY, this.createRegularPolygon(baseSize * 0.75, 5), levelConfig.fruit);

            case 'hexagon':
                return new PolygonShape(centerX, centerY, this.createRegularPolygon(baseSize * 0.75, 6), levelConfig.fruit);

            case 'octagon':
                return new PolygonShape(centerX, centerY, this.createRegularPolygon(baseSize * 0.75, 8), levelConfig.fruit);

            case 'polygon':
                const seed = levelConfig.seed || levelConfig.level;
                return new PolygonShape(centerX, centerY, this.createIrregularPolygon(baseSize * 0.7, seed), levelConfig.fruit);

            case 'star3':
                return new StarShape(centerX, centerY, baseSize * 0.8, baseSize * 0.35, 3, levelConfig.fruit);

            case 'star4':
                return new StarShape(centerX, centerY, baseSize * 0.8, baseSize * 0.4, 4, levelConfig.fruit);

            case 'star5':
                return new StarShape(centerX, centerY, baseSize * 0.8, baseSize * 0.4, 5, levelConfig.fruit);

            case 'star6':
                return new StarShape(centerX, centerY, baseSize * 0.8, baseSize * 0.4, 6, levelConfig.fruit);

            case 'star8':
                return new StarShape(centerX, centerY, baseSize * 0.8, baseSize * 0.35, 8, levelConfig.fruit);

            default:
                return new CircleShape(centerX, centerY, baseSize * 0.8, levelConfig.fruit);
        }
    }

    createRegularPolygon(radius, sides) {
        const vertices = [];
        for (let i = 0; i < sides; i++) {
            const angle = (Math.PI * 2 / sides) * i - Math.PI / 2; // Start from top
            vertices.push({
                x: Math.cos(angle) * radius,
                y: Math.sin(angle) * radius
            });
        }
        return vertices;
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
