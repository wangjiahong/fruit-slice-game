// Slice Line class
class SliceLine {
    constructor(startX, startY) {
        this.startX = startX;
        this.startY = startY;
        this.endX = startX;
        this.endY = startY;
        this.isDrawing = false;
        // Store the path as array of points for smooth trajectory
        this.path = [{x: startX, y: startY}];
    }

    updateEnd(x, y) {
        this.endX = x;
        this.endY = y;
        // Add point to path
        this.path.push({x: x, y: y});
    }

    draw(ctx) {
        ctx.save();

        // Draw black slice path following mouse trajectory
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 2;

        // Draw the path
        if (this.path.length > 1) {
            ctx.beginPath();
            ctx.moveTo(this.path[0].x, this.path[0].y);

            for (let i = 1; i < this.path.length; i++) {
                ctx.lineTo(this.path[i].x, this.path[i].y);
            }

            ctx.stroke();
        }

        // Draw knife tip marker at start point (where cutting begins)
        ctx.fillStyle = '#ff0000';
        ctx.shadowColor = '#ff0000';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(this.startX, this.startY, 6, 0, Math.PI * 2);
        ctx.fill();

        // Draw small indicator at current position
        ctx.fillStyle = '#000000';
        ctx.shadowBlur = 5;
        ctx.beginPath();
        ctx.arc(this.endX, this.endY, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    getLength() {
        const dx = this.endX - this.startX;
        const dy = this.endY - this.startY;
        return Math.sqrt(dx * dx + dy * dy);
    }

    intersectsShape(shape) {
        // Check if the curve path intersects the shape
        // A valid cut means the line goes through the shape (not necessarily through center)

        let hasInside = false;
        let hasOutside = false;

        // Check all points along the path
        for (const point of this.path) {
            if (shape.containsPoint(point.x, point.y)) {
                hasInside = true;
            } else {
                hasOutside = true;
            }

            // Valid cut: path has points both inside and outside the shape
            if (hasInside && hasOutside) {
                return true;
            }
        }

        return false;
    }
}

// Slicer class - handles cutting logic
class Slicer {
    constructor() {
        this.samplingStep = 1; // Count every single pixel for maximum accuracy
        this.subPixelSamples = 4; // Sample 4 points within each pixel (2x2 grid)
    }

    calculateSplit(shape, line) {
        if (!line.intersectsShape(shape)) {
            return null; // Invalid cut
        }

        const bbox = shape.getBoundingBox();
        let leftCount = 0;
        let rightCount = 0;

        // Sub-pixel sampling offsets for 2x2 grid
        const subPixelOffsets = [
            { dx: 0.25, dy: 0.25 },
            { dx: 0.75, dy: 0.25 },
            { dx: 0.25, dy: 0.75 },
            { dx: 0.75, dy: 0.75 }
        ];

        // Sample every pixel with sub-pixel accuracy
        for (let x = Math.floor(bbox.x); x < Math.ceil(bbox.x + bbox.width); x += this.samplingStep) {
            for (let y = Math.floor(bbox.y); y < Math.ceil(bbox.y + bbox.height); y += this.samplingStep) {
                // Sub-pixel sampling: test multiple points within each pixel
                for (const offset of subPixelOffsets) {
                    const sampleX = x + offset.dx;
                    const sampleY = y + offset.dy;

                    if (shape.containsPoint(sampleX, sampleY)) {
                        if (this.isPointLeftOfLine(sampleX, sampleY, line)) {
                            leftCount++;
                        } else {
                            rightCount++;
                        }
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
        // Use the entire curve path, not just start/end points
        // Find the closest segment on the path and use its cross product

        if (line.path.length < 2) {
            // Fallback to start/end if path is too short
            const dx = line.endX - line.startX;
            const dy = line.endY - line.startY;
            const dxp = px - line.startX;
            const dyp = py - line.startY;
            const cross = dx * dyp - dy * dxp;
            return cross > 0;
        }

        // Find the closest segment on the curve path
        let minDistance = Infinity;
        let closestCross = 0;

        for (let i = 0; i < line.path.length - 1; i++) {
            const p1 = line.path[i];
            const p2 = line.path[i + 1];

            // Calculate perpendicular distance from point to this segment
            const dx = p2.x - p1.x;
            const dy = p2.y - p1.y;
            const dxp = px - p1.x;
            const dyp = py - p1.y;

            // Project point onto line segment
            const segmentLengthSq = dx * dx + dy * dy;
            let t = 0;
            if (segmentLengthSq > 0) {
                t = Math.max(0, Math.min(1, (dxp * dx + dyp * dy) / segmentLengthSq));
            }

            // Find closest point on segment
            const closestX = p1.x + t * dx;
            const closestY = p1.y + t * dy;

            // Calculate distance
            const distX = px - closestX;
            const distY = py - closestY;
            const distance = distX * distX + distY * distY;

            if (distance < minDistance) {
                minDistance = distance;
                // Use cross product of this segment
                closestCross = dx * dyp - dy * dxp;
            }
        }

        // Use epsilon for points very close to the line
        const epsilon = 1e-10;
        if (Math.abs(closestCross) < epsilon) {
            return true;
        }

        return closestCross > 0;
    }

    // Calculate score based on deviation from 50:50 - more precise scoring
    calculateScore(deviation, perfectRange, goodRange, timeBonus = 0) {
        let score = 0;

        // Perfect zone: deviation <= perfectRange
        if (deviation <= perfectRange) {
            // Score decreases linearly from 100 to 95 within perfect range
            score = 100 - (deviation / perfectRange) * 5;
        }
        // Good zone: perfectRange < deviation <= goodRange
        else if (deviation <= goodRange) {
            // Score decreases from 95 to 70
            const rangeWidth = goodRange - perfectRange;
            const positionInRange = deviation - perfectRange;
            score = 95 - (positionInRange / rangeWidth) * 25;
        }
        // Normal zone: goodRange < deviation <= 10%
        else if (deviation <= 10) {
            // Score decreases from 70 to 40
            const rangeWidth = 10 - goodRange;
            const positionInRange = deviation - goodRange;
            score = 70 - (positionInRange / rangeWidth) * 30;
        }
        // Poor zone: deviation > 10%
        else {
            // Score decreases from 40 to 0, capped at 20% deviation
            const positionInRange = Math.min(deviation - 10, 10);
            score = Math.max(0, 40 - positionInRange * 4);
        }

        // Add time bonus (up to 15 points for very fast completion)
        score = Math.min(100, score + timeBonus);

        return Math.round(score * 10) / 10; // Return with 1 decimal place
    }

    getResultGrade(deviation, perfectRange, goodRange) {
        if (deviation <= perfectRange) {
            return 'perfect';
        } else if (deviation <= goodRange) {
            return 'good';
        } else if (deviation <= 8) {
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
