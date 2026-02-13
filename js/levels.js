// Level configuration and management
class LevelManager {
    constructor() {
        this.currentLevel = 1;
        this.levels = this.createLevels();
    }

    createLevels() {
        const levels = [];

        // Level 1: Watermelon - Circle - Easy
        levels.push({
            level: 1,
            shape: 'circle',
            fruit: 'watermelon',
            difficulty: 'easy',
            timeLimit: 40,
            cutsAllowed: 1,
            perfectRange: 3,
            goodRange: 6,
            targetScore: 60,
            rotation: 0
        });

        // Level 2: Watermelon - Circle rotated - Getting harder
        levels.push({
            level: 2,
            shape: 'circle',
            fruit: 'watermelon',
            difficulty: 'easy',
            timeLimit: 35,
            cutsAllowed: 1,
            perfectRange: 2.5,
            goodRange: 5.5,
            targetScore: 65,
            rotation: Math.PI / 6
        });

        // Level 3: Orange - Circle - Medium start
        levels.push({
            level: 3,
            shape: 'circle',
            fruit: 'orange',
            difficulty: 'medium',
            timeLimit: 30,
            cutsAllowed: 1,
            perfectRange: 2,
            goodRange: 5,
            targetScore: 70,
            rotation: 0
        });

        // Level 4: Orange - Ellipse - Medium
        levels.push({
            level: 4,
            shape: 'ellipse',
            fruit: 'orange',
            difficulty: 'medium',
            timeLimit: 28,
            cutsAllowed: 1,
            perfectRange: 2,
            goodRange: 5,
            targetScore: 72,
            rotation: Math.PI / 8
        });

        // Level 5: Lemon - Circle - Medium-Hard
        levels.push({
            level: 5,
            shape: 'circle',
            fruit: 'lemon',
            difficulty: 'medium',
            timeLimit: 26,
            cutsAllowed: 1,
            perfectRange: 1.8,
            goodRange: 4.5,
            targetScore: 74,
            rotation: Math.PI / 4
        });

        // Level 6: Lemon - Ellipse - Hard start
        levels.push({
            level: 6,
            shape: 'ellipse',
            fruit: 'lemon',
            difficulty: 'hard',
            timeLimit: 24,
            cutsAllowed: 1,
            perfectRange: 1.6,
            goodRange: 4,
            targetScore: 76,
            rotation: Math.PI / 3
        });

        // Level 7: Lemon - Ellipse - Hard (改为椭圆，延后复杂形状)
        levels.push({
            level: 7,
            shape: 'ellipse',
            fruit: 'lemon',
            difficulty: 'hard',
            timeLimit: 22,
            cutsAllowed: 1,
            perfectRange: 1.5,
            goodRange: 4,
            targetScore: 78,
            rotation: Math.PI / 2.5
        });

        // Level 8: Apple - Ellipse - Hard
        levels.push({
            level: 8,
            shape: 'ellipse',
            fruit: 'apple',
            difficulty: 'hard',
            timeLimit: 20,
            cutsAllowed: 1,
            perfectRange: 1.4,
            goodRange: 3.8,
            targetScore: 80,
            rotation: Math.PI / 2
        });

        // Level 9: Apple - Polygon - Expert start
        levels.push({
            level: 9,
            shape: 'polygon',
            fruit: 'apple',
            difficulty: 'expert',
            timeLimit: 18,
            cutsAllowed: 1,
            perfectRange: 1.2,
            goodRange: 3.5,
            targetScore: 82,
            rotation: Math.PI / 3
        });

        // Level 10: Apple - Star - Expert
        levels.push({
            level: 10,
            shape: 'star',
            fruit: 'apple',
            difficulty: 'expert',
            timeLimit: 16,
            cutsAllowed: 1,
            perfectRange: 1,
            goodRange: 3,
            targetScore: 85,
            rotation: Math.PI / 4
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
