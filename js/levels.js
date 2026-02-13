// Level configuration and management
class LevelManager {
    constructor() {
        this.currentLevel = 1;
        this.levels = this.createLevels();
    }

    createLevels() {
        const levels = [];

        // Levels 1-3: Circle shapes with watermelon
        for (let i = 1; i <= 3; i++) {
            levels.push({
                level: i,
                shape: 'circle',
                fruit: 'watermelon',
                difficulty: 'easy',
                timeLimit: 30,
                cutsAllowed: 1,
                perfectRange: 2,
                goodRange: 5,
                targetScore: 70,
                rotation: 0
            });
        }

        // Levels 4-6: Ellipse shapes with orange
        for (let i = 4; i <= 6; i++) {
            levels.push({
                level: i,
                shape: 'ellipse',
                fruit: 'orange',
                difficulty: 'medium',
                timeLimit: 25,
                cutsAllowed: 1,
                perfectRange: 2,
                goodRange: 5,
                targetScore: 75,
                rotation: (i - 4) * Math.PI / 6 // Increasing rotation
            });
        }

        // Levels 7-9: Polygon shapes with lemon
        for (let i = 7; i <= 9; i++) {
            levels.push({
                level: i,
                shape: 'polygon',
                fruit: 'lemon',
                difficulty: 'hard',
                timeLimit: 20,
                cutsAllowed: 1,
                perfectRange: 1.5,
                goodRange: 4,
                targetScore: 80,
                rotation: (i - 7) * Math.PI / 4
            });
        }

        // Levels 10-12: Star shapes with apple
        for (let i = 10; i <= 12; i++) {
            levels.push({
                level: i,
                shape: 'star',
                fruit: 'apple',
                difficulty: 'expert',
                timeLimit: 18,
                cutsAllowed: 1,
                perfectRange: 1,
                goodRange: 3,
                targetScore: 85,
                rotation: (i - 10) * Math.PI / 5
            });
        }

        // Bonus levels: Mixed challenges with multiple cuts
        for (let i = 13; i <= 15; i++) {
            const shapes = ['circle', 'ellipse', 'polygon', 'star'];
            const fruits = ['watermelon', 'orange', 'lemon', 'apple'];
            const shapeIndex = (i - 13) % shapes.length;

            levels.push({
                level: i,
                shape: shapes[shapeIndex],
                fruit: fruits[shapeIndex],
                difficulty: 'master',
                timeLimit: 15,
                cutsAllowed: 2,
                perfectRange: 1,
                goodRange: 3,
                targetScore: 90,
                rotation: Math.random() * Math.PI * 2
            });
        }

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
        const baseSize = Math.min(canvasWidth, canvasHeight) * 0.3;

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
