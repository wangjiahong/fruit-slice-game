// Base Shape class
class Shape {
    constructor(x, y, rotation = 0) {
        this.x = x;
        this.y = y;
        this.rotation = rotation;
    }

    draw(ctx) {
        throw new Error('draw() must be implemented by subclass');
    }

    containsPoint(x, y) {
        throw new Error('containsPoint() must be implemented by subclass');
    }

    getBoundingBox() {
        throw new Error('getBoundingBox() must be implemented by subclass');
    }

    createPath(ctx) {
        throw new Error('createPath() must be implemented by subclass');
    }
}

// Circle Shape
class CircleShape extends Shape {
    constructor(x, y, radius, fruitType = 'watermelon') {
        super(x, y);
        this.radius = radius;
        this.fruitType = fruitType;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        switch(this.fruitType) {
            case 'watermelon':
                this.drawWatermelon(ctx);
                break;
            case 'orange':
                this.drawOrange(ctx);
                break;
            case 'lemon':
                this.drawLemon(ctx);
                break;
            case 'apple':
                this.drawApple(ctx);
                break;
            default:
                this.drawWatermelon(ctx);
        }

        ctx.restore();
    }

    drawWatermelon(ctx) {
        // Outer dark green
        ctx.fillStyle = '#2d5016';
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fill();

        // Middle light green
        ctx.fillStyle = '#4a7c2c';
        ctx.beginPath();
        ctx.arc(0, 0, this.radius * 0.9, 0, Math.PI * 2);
        ctx.fill();

        // Inner red flesh
        ctx.fillStyle = '#ff6b6b';
        ctx.beginPath();
        ctx.arc(0, 0, this.radius * 0.8, 0, Math.PI * 2);
        ctx.fill();

        // Seeds
        ctx.fillStyle = '#000';
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 / 8) * i;
            const sx = Math.cos(angle) * this.radius * 0.5;
            const sy = Math.sin(angle) * this.radius * 0.5;
            ctx.beginPath();
            ctx.ellipse(sx, sy, 3, 5, angle, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    drawOrange(ctx) {
        // Orange outer
        ctx.fillStyle = '#ff9500';
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fill();

        // Lighter orange inner
        ctx.fillStyle = '#ffb347';
        ctx.beginPath();
        ctx.arc(0, 0, this.radius * 0.85, 0, Math.PI * 2);
        ctx.fill();

        // Segments
        ctx.strokeStyle = '#ff9500';
        ctx.lineWidth = 2;
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 / 8) * i;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(Math.cos(angle) * this.radius * 0.85, Math.sin(angle) * this.radius * 0.85);
            ctx.stroke();
        }

        // Center circle
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(0, 0, this.radius * 0.15, 0, Math.PI * 2);
        ctx.fill();
    }

    drawLemon(ctx) {
        // Yellow outer
        ctx.fillStyle = '#fff44f';
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fill();

        // Lighter yellow inner
        ctx.fillStyle = '#ffff99';
        ctx.beginPath();
        ctx.arc(0, 0, this.radius * 0.85, 0, Math.PI * 2);
        ctx.fill();

        // Segments (fewer than orange)
        ctx.strokeStyle = '#fff44f';
        ctx.lineWidth = 2;
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI * 2 / 6) * i;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(Math.cos(angle) * this.radius * 0.85, Math.sin(angle) * this.radius * 0.85);
            ctx.stroke();
        }

        // Seeds
        ctx.fillStyle = '#8b7355';
        for (let i = 0; i < 4; i++) {
            const angle = (Math.PI * 2 / 4) * i + Math.PI / 4;
            const sx = Math.cos(angle) * this.radius * 0.4;
            const sy = Math.sin(angle) * this.radius * 0.4;
            ctx.beginPath();
            ctx.ellipse(sx, sy, 2, 4, angle, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    drawApple(ctx) {
        // Red gradient
        const gradient = ctx.createRadialGradient(-this.radius * 0.3, -this.radius * 0.3, 0, 0, 0, this.radius);
        gradient.addColorStop(0, '#ff6b6b');
        gradient.addColorStop(1, '#c92a2a');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fill();

        // Highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.arc(-this.radius * 0.3, -this.radius * 0.3, this.radius * 0.4, 0, Math.PI * 2);
        ctx.fill();

        // Stem
        ctx.strokeStyle = '#5c4033';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(0, -this.radius);
        ctx.lineTo(0, -this.radius * 1.2);
        ctx.stroke();

        // Leaf
        ctx.fillStyle = '#4a7c2c';
        ctx.beginPath();
        ctx.ellipse(this.radius * 0.2, -this.radius * 1.1, this.radius * 0.2, this.radius * 0.3, Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();
    }

    containsPoint(x, y) {
        const dx = x - this.x;
        const dy = y - this.y;
        return (dx * dx + dy * dy) <= (this.radius * this.radius);
    }

    getBoundingBox() {
        return {
            x: this.x - this.radius,
            y: this.y - this.radius,
            width: this.radius * 2,
            height: this.radius * 2
        };
    }

    createPath(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    }
}

// Ellipse Shape
class EllipseShape extends Shape {
    constructor(x, y, radiusX, radiusY, rotation = 0, fruitType = 'watermelon') {
        super(x, y, rotation);
        this.radiusX = radiusX;
        this.radiusY = radiusY;
        this.fruitType = fruitType;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        switch(this.fruitType) {
            case 'watermelon':
                this.drawWatermelon(ctx);
                break;
            case 'orange':
                this.drawOrange(ctx);
                break;
            case 'lemon':
                this.drawLemon(ctx);
                break;
            case 'apple':
                this.drawApple(ctx);
                break;
            default:
                this.drawWatermelon(ctx);
        }

        ctx.restore();
    }

    drawWatermelon(ctx) {
        ctx.fillStyle = '#2d5016';
        ctx.beginPath();
        ctx.ellipse(0, 0, this.radiusX, this.radiusY, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#4a7c2c';
        ctx.beginPath();
        ctx.ellipse(0, 0, this.radiusX * 0.9, this.radiusY * 0.9, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ff6b6b';
        ctx.beginPath();
        ctx.ellipse(0, 0, this.radiusX * 0.8, this.radiusY * 0.8, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#000';
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 / 8) * i;
            const sx = Math.cos(angle) * this.radiusX * 0.5;
            const sy = Math.sin(angle) * this.radiusY * 0.5;
            ctx.beginPath();
            ctx.ellipse(sx, sy, 3, 5, angle, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    drawOrange(ctx) {
        ctx.fillStyle = '#ff9500';
        ctx.beginPath();
        ctx.ellipse(0, 0, this.radiusX, this.radiusY, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffb347';
        ctx.beginPath();
        ctx.ellipse(0, 0, this.radiusX * 0.85, this.radiusY * 0.85, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#ff9500';
        ctx.lineWidth = 2;
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 / 8) * i;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(Math.cos(angle) * this.radiusX * 0.85, Math.sin(angle) * this.radiusY * 0.85);
            ctx.stroke();
        }

        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(0, 0, Math.min(this.radiusX, this.radiusY) * 0.15, 0, Math.PI * 2);
        ctx.fill();
    }

    drawLemon(ctx) {
        ctx.fillStyle = '#fff44f';
        ctx.beginPath();
        ctx.ellipse(0, 0, this.radiusX, this.radiusY, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffff99';
        ctx.beginPath();
        ctx.ellipse(0, 0, this.radiusX * 0.85, this.radiusY * 0.85, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#fff44f';
        ctx.lineWidth = 2;
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI * 2 / 6) * i;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(Math.cos(angle) * this.radiusX * 0.85, Math.sin(angle) * this.radiusY * 0.85);
            ctx.stroke();
        }
    }

    drawApple(ctx) {
        const gradient = ctx.createRadialGradient(-this.radiusX * 0.3, -this.radiusY * 0.3, 0, 0, 0, Math.max(this.radiusX, this.radiusY));
        gradient.addColorStop(0, '#ff6b6b');
        gradient.addColorStop(1, '#c92a2a');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.ellipse(0, 0, this.radiusX, this.radiusY, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.arc(-this.radiusX * 0.3, -this.radiusY * 0.3, Math.min(this.radiusX, this.radiusY) * 0.4, 0, Math.PI * 2);
        ctx.fill();
    }

    containsPoint(x, y) {
        const dx = x - this.x;
        const dy = y - this.y;

        const cos = Math.cos(-this.rotation);
        const sin = Math.sin(-this.rotation);
        const rotatedX = dx * cos - dy * sin;
        const rotatedY = dx * sin + dy * cos;

        return ((rotatedX * rotatedX) / (this.radiusX * this.radiusX) +
                (rotatedY * rotatedY) / (this.radiusY * this.radiusY)) <= 1;
    }

    getBoundingBox() {
        const maxRadius = Math.max(this.radiusX, this.radiusY);
        return {
            x: this.x - maxRadius,
            y: this.y - maxRadius,
            width: maxRadius * 2,
            height: maxRadius * 2
        };
    }

    createPath(ctx) {
        ctx.beginPath();
        ctx.ellipse(this.x, this.y, this.radiusX, this.radiusY, this.rotation, 0, Math.PI * 2);
    }
}

// Polygon Shape (irregular)
class PolygonShape extends Shape {
    constructor(x, y, vertices, fruitType = 'watermelon') {
        super(x, y);
        this.vertices = vertices; // Array of {x, y} relative to center
        this.fruitType = fruitType;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        // Create clipping path for the polygon
        ctx.beginPath();
        ctx.moveTo(this.vertices[0].x, this.vertices[0].y);
        for (let i = 1; i < this.vertices.length; i++) {
            ctx.lineTo(this.vertices[i].x, this.vertices[i].y);
        }
        ctx.closePath();
        ctx.clip();

        // Calculate approximate radius for drawing
        let maxDist = 0;
        for (const v of this.vertices) {
            const dist = Math.sqrt(v.x * v.x + v.y * v.y);
            if (dist > maxDist) maxDist = dist;
        }

        // Draw fruit texture
        switch(this.fruitType) {
            case 'watermelon':
                this.drawWatermelonTexture(ctx, maxDist);
                break;
            case 'orange':
                this.drawOrangeTexture(ctx, maxDist);
                break;
            case 'lemon':
                this.drawLemonTexture(ctx, maxDist);
                break;
            case 'apple':
                this.drawAppleTexture(ctx, maxDist);
                break;
            default:
                this.drawWatermelonTexture(ctx, maxDist);
        }

        ctx.restore();

        // Draw outline
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.vertices[0].x, this.vertices[0].y);
        for (let i = 1; i < this.vertices.length; i++) {
            ctx.lineTo(this.vertices[i].x, this.vertices[i].y);
        }
        ctx.closePath();
        ctx.stroke();
        ctx.restore();
    }

    drawWatermelonTexture(ctx, radius) {
        ctx.fillStyle = '#2d5016';
        ctx.fillRect(-radius, -radius, radius * 2, radius * 2);

        ctx.fillStyle = '#4a7c2c';
        ctx.beginPath();
        ctx.arc(0, 0, radius * 0.9, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ff6b6b';
        ctx.beginPath();
        ctx.arc(0, 0, radius * 0.75, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#000';
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 / 8) * i;
            const sx = Math.cos(angle) * radius * 0.4;
            const sy = Math.sin(angle) * radius * 0.4;
            ctx.beginPath();
            ctx.arc(sx, sy, 3, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    drawOrangeTexture(ctx, radius) {
        ctx.fillStyle = '#ff9500';
        ctx.fillRect(-radius, -radius, radius * 2, radius * 2);

        ctx.fillStyle = '#ffb347';
        ctx.beginPath();
        ctx.arc(0, 0, radius * 0.85, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#ff9500';
        ctx.lineWidth = 2;
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 / 8) * i;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
            ctx.stroke();
        }
    }

    drawLemonTexture(ctx, radius) {
        ctx.fillStyle = '#fff44f';
        ctx.fillRect(-radius, -radius, radius * 2, radius * 2);

        ctx.fillStyle = '#ffff99';
        ctx.beginPath();
        ctx.arc(0, 0, radius * 0.85, 0, Math.PI * 2);
        ctx.fill();
    }

    drawAppleTexture(ctx, radius) {
        const gradient = ctx.createRadialGradient(-radius * 0.3, -radius * 0.3, 0, 0, 0, radius);
        gradient.addColorStop(0, '#ff6b6b');
        gradient.addColorStop(1, '#c92a2a');
        ctx.fillStyle = gradient;
        ctx.fillRect(-radius, -radius, radius * 2, radius * 2);
    }

    containsPoint(x, y) {
        const dx = x - this.x;
        const dy = y - this.y;

        const cos = Math.cos(-this.rotation);
        const sin = Math.sin(-this.rotation);
        const rotatedX = dx * cos - dy * sin;
        const rotatedY = dx * sin + dy * cos;

        // Ray casting algorithm
        let inside = false;
        for (let i = 0, j = this.vertices.length - 1; i < this.vertices.length; j = i++) {
            const xi = this.vertices[i].x, yi = this.vertices[i].y;
            const xj = this.vertices[j].x, yj = this.vertices[j].y;

            const intersect = ((yi > rotatedY) !== (yj > rotatedY))
                && (rotatedX < (xj - xi) * (rotatedY - yi) / (yj - yi) + xi);
            if (intersect) inside = !inside;
        }
        return inside;
    }

    getBoundingBox() {
        let minX = Infinity, minY = Infinity;
        let maxX = -Infinity, maxY = -Infinity;

        for (const v of this.vertices) {
            const cos = Math.cos(this.rotation);
            const sin = Math.sin(this.rotation);
            const rotatedX = v.x * cos - v.y * sin + this.x;
            const rotatedY = v.x * sin + v.y * cos + this.y;

            minX = Math.min(minX, rotatedX);
            minY = Math.min(minY, rotatedY);
            maxX = Math.max(maxX, rotatedX);
            maxY = Math.max(maxY, rotatedY);
        }

        return {
            x: minX,
            y: minY,
            width: maxX - minX,
            height: maxY - minY
        };
    }

    createPath(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.beginPath();
        ctx.moveTo(this.vertices[0].x, this.vertices[0].y);
        for (let i = 1; i < this.vertices.length; i++) {
            ctx.lineTo(this.vertices[i].x, this.vertices[i].y);
        }
        ctx.closePath();
        ctx.restore();
    }
}

// Star Shape
class StarShape extends Shape {
    constructor(x, y, outerRadius, innerRadius, points = 5, fruitType = 'watermelon') {
        super(x, y);
        this.outerRadius = outerRadius;
        this.innerRadius = innerRadius;
        this.points = points;
        this.fruitType = fruitType;
        this.generateVertices();
    }

    generateVertices() {
        this.vertices = [];
        for (let i = 0; i < this.points * 2; i++) {
            const angle = (Math.PI / this.points) * i - Math.PI / 2;
            const radius = i % 2 === 0 ? this.outerRadius : this.innerRadius;
            this.vertices.push({
                x: Math.cos(angle) * radius,
                y: Math.sin(angle) * radius
            });
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        ctx.beginPath();
        ctx.moveTo(this.vertices[0].x, this.vertices[0].y);
        for (let i = 1; i < this.vertices.length; i++) {
            ctx.lineTo(this.vertices[i].x, this.vertices[i].y);
        }
        ctx.closePath();
        ctx.clip();

        switch(this.fruitType) {
            case 'watermelon':
                this.drawWatermelonTexture(ctx);
                break;
            case 'orange':
                this.drawOrangeTexture(ctx);
                break;
            case 'lemon':
                this.drawLemonTexture(ctx);
                break;
            case 'apple':
                this.drawAppleTexture(ctx);
                break;
            default:
                this.drawWatermelonTexture(ctx);
        }

        ctx.restore();

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.vertices[0].x, this.vertices[0].y);
        for (let i = 1; i < this.vertices.length; i++) {
            ctx.lineTo(this.vertices[i].x, this.vertices[i].y);
        }
        ctx.closePath();
        ctx.stroke();
        ctx.restore();
    }

    drawWatermelonTexture(ctx) {
        ctx.fillStyle = '#2d5016';
        ctx.fillRect(-this.outerRadius, -this.outerRadius, this.outerRadius * 2, this.outerRadius * 2);

        ctx.fillStyle = '#4a7c2c';
        ctx.beginPath();
        ctx.arc(0, 0, this.outerRadius * 0.9, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ff6b6b';
        ctx.beginPath();
        ctx.arc(0, 0, this.outerRadius * 0.7, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#000';
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI * 2 / 6) * i;
            const sx = Math.cos(angle) * this.outerRadius * 0.4;
            const sy = Math.sin(angle) * this.outerRadius * 0.4;
            ctx.beginPath();
            ctx.arc(sx, sy, 3, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    drawOrangeTexture(ctx) {
        ctx.fillStyle = '#ff9500';
        ctx.fillRect(-this.outerRadius, -this.outerRadius, this.outerRadius * 2, this.outerRadius * 2);

        ctx.fillStyle = '#ffb347';
        ctx.beginPath();
        ctx.arc(0, 0, this.outerRadius * 0.85, 0, Math.PI * 2);
        ctx.fill();
    }

    drawLemonTexture(ctx) {
        ctx.fillStyle = '#fff44f';
        ctx.fillRect(-this.outerRadius, -this.outerRadius, this.outerRadius * 2, this.outerRadius * 2);

        ctx.fillStyle = '#ffff99';
        ctx.beginPath();
        ctx.arc(0, 0, this.outerRadius * 0.85, 0, Math.PI * 2);
        ctx.fill();
    }

    drawAppleTexture(ctx) {
        const gradient = ctx.createRadialGradient(-this.outerRadius * 0.3, -this.outerRadius * 0.3, 0, 0, 0, this.outerRadius);
        gradient.addColorStop(0, '#ff6b6b');
        gradient.addColorStop(1, '#c92a2a');
        ctx.fillStyle = gradient;
        ctx.fillRect(-this.outerRadius, -this.outerRadius, this.outerRadius * 2, this.outerRadius * 2);
    }

    containsPoint(x, y) {
        const dx = x - this.x;
        const dy = y - this.y;

        const cos = Math.cos(-this.rotation);
        const sin = Math.sin(-this.rotation);
        const rotatedX = dx * cos - dy * sin;
        const rotatedY = dx * sin + dy * cos;

        let inside = false;
        for (let i = 0, j = this.vertices.length - 1; i < this.vertices.length; j = i++) {
            const xi = this.vertices[i].x, yi = this.vertices[i].y;
            const xj = this.vertices[j].x, yj = this.vertices[j].y;

            const intersect = ((yi > rotatedY) !== (yj > rotatedY))
                && (rotatedX < (xj - xi) * (rotatedY - yi) / (yj - yi) + xi);
            if (intersect) inside = !inside;
        }
        return inside;
    }

    getBoundingBox() {
        return {
            x: this.x - this.outerRadius,
            y: this.y - this.outerRadius,
            width: this.outerRadius * 2,
            height: this.outerRadius * 2
        };
    }

    createPath(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.beginPath();
        ctx.moveTo(this.vertices[0].x, this.vertices[0].y);
        for (let i = 1; i < this.vertices.length; i++) {
            ctx.lineTo(this.vertices[i].x, this.vertices[i].y);
        }
        ctx.closePath();
        ctx.restore();
    }
}
