// Slice Line class
class SliceLine {
    constructor(startX, startY) {
        this.startX = startX;
        this.startY = startY;
        this.endX = startX;
        this.endY = startY;
        this.isDrawing = false;
    }

    updateEnd(x, y) {
        this.endX = x;
        this.endY = y;
    }

    draw(ctx) {
        ctx.save();
        ctx.strokeStyle = '#ff4757';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.shadowColor = '#ff4757';
        ctx.shadowBlur = 10;

        ctx.beginPath();
        ctx.moveTo(this.startX, this.startY);
        ctx.lineTo(this.endX, this.endY);
        ctx.stroke();

        // Draw points at ends
        ctx.fillStyle = '#ff4757';
        ctx.beginPath();
        ctx.arc(this.startX, this.startY, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(this.endX, this.endY, 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    getLength() {
        const dx = this.endX - this.startX;
        const dy = this.endY - this.startY;
        return Math.sqrt(dx * dx + dy * dy);
    }

    intersectsShape(shape) {
        // Check if line endpoints are on opposite sides of the shape
        // or if the line passes through the shape
        const startInside = shape.containsPoint(this.startX, this.startY);
        const endInside = shape.containsPoint(this.endX, this.endY);

        // Valid cut: one point inside, one outside, or both outside but line crosses shape
        if (startInside !== endInside) {
            return true;
        }

        // Both outside - need to check if line intersects shape
        if (!startInside && !endInside) {
            // Sample points along the line
            const steps = 20;
            for (let i = 1; i < steps; i++) {
                const t = i / steps;
                const x = this.startX + (this.endX - this.startX) * t;
                const y = this.startY + (this.endY - this.startY) * t;
                if (shape.containsPoint(x, y)) {
                    return true;
                }
            }
        }

        return false;
    }
}

// Slicer class - handles cutting logic
class Slicer {
    constructor() {
        this.samplingStep = 2; // Pixel sampling step for accuracy vs performance
    }

    calculateSplit(shape, line) {
        if (!line.intersectsShape(shape)) {
            return null; // Invalid cut
        }

        const bbox = shape.getBoundingBox();
        let leftCount = 0;
        let rightCount = 0;

        // Create an off-screen canvas for accurate pixel testing
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = bbox.width;
        tempCanvas.height = bbox.height;
        const tempCtx = tempCanvas.getContext('2d');

        // Translate context to match bounding box
        tempCtx.translate(-bbox.x, -bbox.y);

        // Create shape path
        shape.createPath(tempCtx);

        // Sample points
        for (let x = bbox.x; x < bbox.x + bbox.width; x += this.samplingStep) {
            for (let y = bbox.y; y < bbox.y + bbox.height; y += this.samplingStep) {
                if (shape.containsPoint(x, y)) {
                    if (this.isPointLeftOfLine(x, y, line)) {
                        leftCount++;
                    } else {
                        rightCount++;
                    }
                }
            }
        }

        const total = leftCount + rightCount;
        if (total === 0) {
            return null;
        }

        const leftPercent = (leftCount / total) * 100;
        const rightPercent = (rightCount / total) * 100;

        return {
            left: leftPercent,
            right: rightPercent,
            deviation: Math.abs(50 - leftPercent)
        };
    }

    isPointLeftOfLine(px, py, line) {
        // Use cross product to determine which side of the line the point is on
        const dx = line.endX - line.startX;
        const dy = line.endY - line.startY;
        const dxp = px - line.startX;
        const dyp = py - line.startY;

        const cross = dx * dyp - dy * dxp;
        return cross > 0;
    }

    // Calculate score based on deviation from 50:50
    calculateScore(deviation, perfectRange, goodRange, timeBonus = 0) {
        let score = 0;

        if (deviation <= perfectRange) {
            score = 100; // Perfect cut
        } else if (deviation <= goodRange) {
            // Good cut: 85-99
            score = 100 - (deviation - perfectRange) * 3;
        } else {
            // Normal/Poor cut: 0-84
            score = Math.max(0, 85 - (deviation - goodRange) * 2);
        }

        // Add time bonus (up to 10 points)
        score = Math.min(100, score + timeBonus);

        return Math.round(score);
    }

    getResultGrade(deviation, perfectRange, goodRange) {
        if (deviation <= perfectRange) {
            return 'perfect';
        } else if (deviation <= goodRange) {
            return 'good';
        } else if (deviation <= 10) {
            return 'normal';
        } else {
            return 'poor';
        }
    }

    getResultMessage(grade) {
        const messages = {
            perfect: '完美切割！🎉',
            good: '干得漂亮！👍',
            normal: '还不错！😊',
            poor: '继续努力！💪'
        };
        return messages[grade] || messages.normal;
    }

    // Visualize the split (for debugging or visual feedback)
    visualizeSplit(ctx, shape, line, splitResult) {
        if (!splitResult) return;

        const bbox = shape.getBoundingBox();

        ctx.save();
        ctx.globalAlpha = 0.3;

        // Draw left side in blue
        for (let x = bbox.x; x < bbox.x + bbox.width; x += this.samplingStep * 2) {
            for (let y = bbox.y; y < bbox.y + bbox.height; y += this.samplingStep * 2) {
                if (shape.containsPoint(x, y)) {
                    if (this.isPointLeftOfLine(x, y, line)) {
                        ctx.fillStyle = '#3498db';
                        ctx.fillRect(x, y, this.samplingStep * 2, this.samplingStep * 2);
                    }
                }
            }
        }

        // Draw right side in red
        for (let x = bbox.x; x < bbox.x + bbox.width; x += this.samplingStep * 2) {
            for (let y = bbox.y; y < bbox.y + bbox.height; y += this.samplingStep * 2) {
                if (shape.containsPoint(x, y)) {
                    if (!this.isPointLeftOfLine(x, y, line)) {
                        ctx.fillStyle = '#e74c3c';
                        ctx.fillRect(x, y, this.samplingStep * 2, this.samplingStep * 2);
                    }
                }
            }
        }

        ctx.restore();

        // Draw the line again on top
        line.draw(ctx);

        // Draw percentages
        ctx.save();
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#fff';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;

        // Find center points of each side
        const centerX = shape.x;
        const centerY = shape.y;

        // Calculate offset perpendicular to the line
        const lineAngle = Math.atan2(line.endY - line.startY, line.endX - line.startX);
        const perpAngle = lineAngle + Math.PI / 2;
        const offset = 40;

        const leftX = centerX + Math.cos(perpAngle) * offset;
        const leftY = centerY + Math.sin(perpAngle) * offset;
        const rightX = centerX - Math.cos(perpAngle) * offset;
        const rightY = centerY - Math.sin(perpAngle) * offset;

        // Draw left percentage
        const leftText = splitResult.left.toFixed(1) + '%';
        ctx.strokeText(leftText, leftX, leftY);
        ctx.fillText(leftText, leftX, leftY);

        // Draw right percentage
        const rightText = splitResult.right.toFixed(1) + '%';
        ctx.strokeText(rightText, rightX, rightY);
        ctx.fillText(rightText, rightX, rightY);

        ctx.restore();
    }

    // Animation helper for split pieces
    createSplitAnimation(shape, line) {
        // Calculate separation vector (perpendicular to cut line)
        const lineAngle = Math.atan2(line.endY - line.startY, line.endX - line.startX);
        const perpAngle = lineAngle + Math.PI / 2;

        return {
            leftOffset: { x: 0, y: 0 },
            rightOffset: { x: 0, y: 0 },
            perpAngle: perpAngle,
            duration: 0,
            maxDuration: 30, // frames

            update() {
                if (this.duration < this.maxDuration) {
                    this.duration++;
                    const progress = this.duration / this.maxDuration;
                    const easing = progress * progress; // Ease out
                    const distance = 30 * easing;

                    this.leftOffset.x = Math.cos(this.perpAngle) * distance;
                    this.leftOffset.y = Math.sin(this.perpAngle) * distance;
                    this.rightOffset.x = -Math.cos(this.perpAngle) * distance;
                    this.rightOffset.y = -Math.sin(this.perpAngle) * distance;
                }
                return this.duration < this.maxDuration;
            },

            isComplete() {
                return this.duration >= this.maxDuration;
            }
        };
    }
}
