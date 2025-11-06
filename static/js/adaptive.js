// Adaptive Difficulty System
class AdaptiveSystem {
    constructor() {
        this.facialStress = 0.5;
        this.keyboardStress = 0.5;
        this.combinedStress = 0.5;
        this.difficulty = 1.0;
        this.stressHistory = [];
        this.chart = null;
        this.playerId = emotionDetector.getPlayerId();
        this.initChart();
        this.setupEventListeners();
    }

    initChart() {
        const ctx = document.getElementById('stressChart');
        if (!ctx) return;

        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [
                    {
                        label: 'Facial Stress',
                        data: [],
                        borderColor: 'rgb(99, 102, 241)',
                        backgroundColor: 'rgba(99, 102, 241, 0.1)',
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'Keyboard Stress',
                        data: [],
                        borderColor: 'rgb(139, 92, 246)',
                        backgroundColor: 'rgba(139, 92, 246, 0.1)',
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'Combined Stress',
                        data: [],
                        borderColor: 'rgb(16, 185, 129)',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        tension: 0.4,
                        fill: true
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: {
                            color: '#94a3b8'
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 1.0,
                        ticks: {
                            color: '#94a3b8'
                        },
                        grid: {
                            color: 'rgba(148, 163, 184, 0.1)'
                        }
                    },
                    x: {
                        ticks: {
                            color: '#94a3b8'
                        },
                        grid: {
                            color: 'rgba(148, 163, 184, 0.1)'
                        }
                    }
                }
            }
        });
    }

    setupEventListeners() {
        // Listen for facial stress updates
        window.addEventListener('facialStressUpdate', (event) => {
            this.facialStress = event.detail.stress;
            this.updateCombinedStress();
        });

        // Listen for keyboard stress updates
        window.addEventListener('keyboardStressUpdate', (event) => {
            this.keyboardStress = event.detail.stress;
            this.updateCombinedStress();
        });

        // Update player ID when emotion detector resets
        window.addEventListener('playerReset', () => {
            this.playerId = emotionDetector.getPlayerId();
        });
    }

    updateCombinedStress() {
        // Weighted combination: 60% facial, 40% keyboard
        this.combinedStress = (this.facialStress * 0.6) + (this.keyboardStress * 0.4);
        
        this.updateDisplays();
        this.updateDifficulty();
        this.updateChart();
    }

    updateDisplays() {
        // Update combined stress display
        const combinedStressElement = document.getElementById('combined-stress');
        const combinedStressBar = document.getElementById('combined-stress-bar');
        
        if (combinedStressElement) {
            combinedStressElement.textContent = this.combinedStress.toFixed(2);
        }
        
        if (combinedStressBar) {
            combinedStressBar.style.width = (this.combinedStress * 100) + '%';
        }

        // Update keyboard stress display
        const keyboardStressElement = document.getElementById('keyboard-stress');
        const keyboardStressBar = document.getElementById('keyboard-stress-bar');
        
        if (keyboardStressElement) {
            keyboardStressElement.textContent = this.keyboardStress.toFixed(2);
        }
        
        if (keyboardStressBar) {
            keyboardStressBar.style.width = (this.keyboardStress * 100) + '%';
        }
    }

    async updateDifficulty() {
        try {
            const response = await fetch('/api/update-difficulty', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    player_id: this.playerId,
                    facial_stress: this.facialStress,
                    keyboard_stress: this.keyboardStress
                })
            });

            if (!response.ok) {
                throw new Error('Difficulty update failed');
            }

            const data = await response.json();
            this.difficulty = data.difficulty;
            
            this.updateDifficultyDisplay(data.difficulty, data.recommendation);
            
            // Emit difficulty update event
            window.dispatchEvent(new CustomEvent('difficultyUpdate', {
                detail: {
                    difficulty: this.difficulty,
                    combinedStress: this.combinedStress,
                    recommendation: data.recommendation
                }
            }));

        } catch (error) {
            console.error('Error updating difficulty:', error);
        }
    }

    updateDifficultyDisplay(difficulty, recommendation) {
        const difficultyElement = document.getElementById('difficulty');
        const difficultyLabel = document.getElementById('difficulty-label');
        
        if (difficultyElement) {
            difficultyElement.textContent = difficulty.toFixed(2);
        }
        
        if (difficultyLabel) {
            let label = 'Normal';
            if (difficulty < 0.7) {
                label = 'Easy';
            } else if (difficulty < 1.0) {
                label = 'Normal';
            } else if (difficulty < 1.5) {
                label = 'Hard';
            } else if (difficulty < 2.0) {
                label = 'Very Hard';
            } else {
                label = 'Extreme';
            }
            difficultyLabel.textContent = label;
        }
    }

    updateChart() {
        if (!this.chart) return;

        const now = new Date().toLocaleTimeString();
        const maxDataPoints = 30;

        // Add new data points
        this.chart.data.labels.push(now);
        this.chart.data.datasets[0].data.push(this.facialStress);
        this.chart.data.datasets[1].data.push(this.keyboardStress);
        this.chart.data.datasets[2].data.push(this.combinedStress);

        // Remove old data points
        if (this.chart.data.labels.length > maxDataPoints) {
            this.chart.data.labels.shift();
            this.chart.data.datasets.forEach(dataset => dataset.data.shift());
        }

        this.chart.update('none'); // 'none' for smooth animation
    }

    getDifficulty() {
        return this.difficulty;
    }

    getCombinedStress() {
        return this.combinedStress;
    }

    reset() {
        this.facialStress = 0.5;
        this.keyboardStress = 0.5;
        this.combinedStress = 0.5;
        this.difficulty = 1.0;
        this.stressHistory = [];
        
        if (this.chart) {
            this.chart.data.labels = [];
            this.chart.data.datasets.forEach(dataset => {
                dataset.data = [];
            });
            this.chart.update();
        }
        
        this.updateDisplays();
    }
}

// Initialize adaptive system
const adaptiveSystem = new AdaptiveSystem();



