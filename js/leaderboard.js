// Leaderboard Manager
class LeaderboardManager {
    constructor() {
        this.homeLeaderboardList = document.getElementById('home-leaderboard-list');
        this.liveLeaderboardList = document.getElementById('live-leaderboard-list');

        // Famous people for global leaderboard - with decimal points
        this.globalPlayers = [
            { name: '梅西', score: 1387.5, country: '🇦🇷' },
            { name: 'C罗', score: 1361.2, country: '🇵🇹' },
            { name: '内马尔', score: 1298.8, country: '🇧🇷' },
            { name: '姆巴佩', score: 1275.3, country: '🇫🇷' },
            { name: '哈兰德', score: 1243.7, country: '🇳🇴' },
            { name: '德布劳内', score: 1219.4, country: '🇧🇪' },
            { name: '莫德里奇', score: 1187.9, country: '🇭🇷' },
            { name: '贝林厄姆', score: 1156.6, country: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' }
        ];

        // Current session players (simulated live players)
        this.livePlayersTemplates = [
            { name: '张伟', country: '🇨🇳' },
            { name: 'Emily', country: '🇺🇸' },
            { name: 'Yuki', country: '🇯🇵' },
            { name: 'Hans', country: '🇩🇪' },
            { name: 'Maria', country: '🇪🇸' },
            { name: 'Pierre', country: '🇫🇷' },
            { name: 'Ahmed', country: '🇪🇬' }
        ];

        this.livePlayers = [];
        this.currentPlayerScore = 0;

        this.initializeHomeLeaderboard();
    }

    initializeHomeLeaderboard() {
        if (!this.homeLeaderboardList) return;

        this.homeLeaderboardList.innerHTML = '';

        this.globalPlayers.forEach((player, index) => {
            const item = document.createElement('div');
            item.className = 'leaderboard-item';
            item.innerHTML = `
                <span class="leaderboard-rank">${index + 1}.</span>
                <span class="leaderboard-name">${player.country} ${player.name}</span>
                <span class="leaderboard-score">${player.score.toFixed(1)}</span>
            `;
            this.homeLeaderboardList.appendChild(item);
        });
    }

    initializeLiveLeaderboard(playerScore = 0) {
        if (!this.liveLeaderboardList) return;

        this.currentPlayerScore = playerScore;

        // Generate realistic scores for live players
        this.livePlayers = [];
        const numPlayers = 4 + Math.floor(Math.random() * 3); // 4-6 players

        // Shuffle templates
        const shuffled = [...this.livePlayersTemplates].sort(() => Math.random() - 0.5);

        for (let i = 0; i < Math.min(numPlayers, shuffled.length); i++) {
            const template = shuffled[i];

            // Generate more realistic scores
            // Some players better than you, some worse
            let score;
            if (i < numPlayers / 2) {
                // Better players: 10-50 points ahead
                score = Math.floor(playerScore + 10 + Math.random() * 40);
            } else {
                // Worse players: 10-50 points behind
                score = Math.max(0, Math.floor(playerScore - 10 - Math.random() * 40));
            }

            this.livePlayers.push({
                name: template.name,
                country: template.country,
                score: score
            });
        }

        // Add current player
        this.livePlayers.push({
            name: '你',
            country: '🎮',
            score: this.currentPlayerScore,
            isPlayer: true
        });

        this.updateLiveLeaderboard();
    }

    updateLiveLeaderboard(playerScore = null) {
        if (!this.liveLeaderboardList) return;

        if (playerScore !== null) {
            this.currentPlayerScore = playerScore;
            // Update player's score in the list
            const playerEntry = this.livePlayers.find(p => p.isPlayer);
            if (playerEntry) {
                playerEntry.score = playerScore;
            }
        }

        // Sort by score
        this.livePlayers.sort((a, b) => b.score - a.score);

        // Update display
        this.liveLeaderboardList.innerHTML = '';

        this.livePlayers.forEach((player, index) => {
            const item = document.createElement('div');
            item.className = 'leaderboard-item';
            if (player.isPlayer) {
                item.classList.add('current-player');
            }

            item.innerHTML = `
                <span class="leaderboard-rank">${index + 1}.</span>
                <span class="leaderboard-name">${player.country} ${player.name}</span>
                <span class="leaderboard-score">${typeof player.score === 'number' ? player.score.toFixed(1) : player.score}</span>
            `;
            this.liveLeaderboardList.appendChild(item);
        });
    }

    // Simulate other players' scores changing slightly over time
    simulateLiveUpdates() {
        this.liveUpdateInterval = setInterval(() => {
            let changed = false;
            this.livePlayers.forEach(player => {
                if (!player.isPlayer && Math.random() < 0.2) { // 20% chance (less frequent)
                    // Smaller, more realistic score changes (±5 to ±15 points)
                    const change = Math.floor((Math.random() - 0.5) * 30);
                    player.score = Math.max(0, player.score + change);
                    changed = true;
                }
            });

            if (changed) {
                this.updateLiveLeaderboard();
            }
        }, 5000); // Update every 5 seconds (less frequent)
    }

    stopLiveUpdates() {
        if (this.liveUpdateInterval) {
            clearInterval(this.liveUpdateInterval);
            this.liveUpdateInterval = null;
        }
    }

    // Check if player made it to global leaderboard
    checkGlobalLeaderboard(totalScore) {
        const lowestGlobalScore = this.globalPlayers[this.globalPlayers.length - 1].score;
        return totalScore > lowestGlobalScore;
    }

    addToGlobalLeaderboard(name, score) {
        this.globalPlayers.push({
            name: name,
            score: score,
            country: '🎮'
        });

        this.globalPlayers.sort((a, b) => b.score - a.score);
        this.globalPlayers = this.globalPlayers.slice(0, 8); // Keep top 8

        this.initializeHomeLeaderboard();
    }
}
