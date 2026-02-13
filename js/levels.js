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

        // 15个不同的形状，难度递增
        const shapes = [
            { shape: 'circle', difficulty: 'easy', timeLimit: 40 },
            { shape: 'ellipse', difficulty: 'easy', timeLimit: 38, radiusX: 1.0, radiusY: 0.6, rotation: 0 },
            { shape: 'triangle', difficulty: 'medium', timeLimit: 36 },
            { shape: 'square', difficulty: 'medium', timeLimit: 34 },
            { shape: 'ellipse', difficulty: 'medium', timeLimit: 32, radiusX: 0.7, radiusY: 1.0, rotation: 0 },
            { shape: 'pentagon', difficulty: 'medium', timeLimit: 30 },
            { shape: 'hexagon', difficulty: 'hard', timeLimit: 28 },
            { shape: 'star3', difficulty: 'hard', timeLimit: 26 },
            { shape: 'octagon', difficulty: 'hard', timeLimit: 24 },
            { shape: 'star4', difficulty: 'hard', timeLimit: 22 },
            { shape: 'ellipse', difficulty: 'expert', timeLimit: 20, radiusX: 1.2, radiusY: 0.5, rotation: Math.PI / 6 },
            { shape: 'star5', difficulty: 'expert', timeLimit: 18 },
            { shape: 'star6', difficulty: 'expert', timeLimit: 16 },
            { shape: 'polygon', difficulty: 'expert', timeLimit: 14 },
            { shape: 'star8', difficulty: 'expert', timeLimit: 12 }
        ];

        shapes.forEach((config, index) => {
            levels.push({
                level: index + 1,
                shape: config.shape,
                fruit: fruits[fruitIndex],
                difficulty: config.difficulty,
                timeLimit: config.timeLimit,
                cutsAllowed: 1,
                perfectRange: 3 - (index * 0.12),
                goodRange: 6 - (index * 0.15),
                targetScore: 0,
                rotation: config.rotation || 0,
                radiusX: config.radiusX,
                radiusY: config.radiusY
            });
            fruitIndex = (fruitIndex + 1) % fruits.length;
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
                return new PolygonShape(centerX, centerY, this.createIrregularPolygon(baseSize * 0.7, levelConfig.level), levelConfig.fruit);

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
