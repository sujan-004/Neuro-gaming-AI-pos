// Game Logic
class AdaptiveGame {
    constructor() {
        this.isPlaying = false;
        this.isPaused = false;
        this.score = 0;
        this.level = 1;
        this.startTime = 0;
        this.currentWord = '';
        this.wordIndex = 0;
        this.words = [];
        this.timer = null;
        this.timeElapsed = 0;
        this.keyboardData = {
            pressTimes: [],
            releaseTimes: [],
            pressDurations: [],
            intervals: [],
            errors: 0,
            totalKeys: 0
        };
        this.lastKeyTime = 0;
        this.setupGame();
        this.setupKeyboardTracking();
    }

    setupGame() {
        // Word lists by difficulty category
        this.wordLists = {
            easy: ['cat', 'dog', 'sun', 'moon', 'star', 'tree', 'bird', 'fish', 'book', 'car', 'house', 'water', 'food', 'love', 'happy'],
            medium: ['computer', 'internet', 'keyboard', 'monitor', 'software', 'hardware', 'network', 'browser', 'website', 'digital', 'virtual', 'program', 'system', 'server', 'database'],
            hard: ['algorithm', 'artificial', 'intelligence', 'machine', 'learning', 'neural', 'network', 'optimization', 'architecture', 'implementation', 'sophisticated', 'comprehensive', 'revolutionary', 'transformation', 'innovation'],
            extreme: ['psychophysiological', 'electroencephalography', 'multidimensional', 'interdisciplinary', 'sophisticatedly', 'comprehensively', 'revolutionarily', 'transformationally', 'innovatively', 'paradigmatically']
        };

        this.generateWordList();
        this.setupEventListeners();
    }

    generateWordList() {
        this.words = [];
        const difficulty = adaptiveSystem.getDifficulty();
        
        let easyRatio = 0, mediumRatio = 0, hardRatio = 0, extremeRatio = 0;
        
        if (difficulty < 0.7) {
            easyRatio = 0.7;
            mediumRatio = 0.3;
        } else if (difficulty < 1.0) {
            easyRatio = 0.4;
            mediumRatio = 0.6;
        } else if (difficulty < 1.5) {
            mediumRatio = 0.5;
            hardRatio = 0.5;
        } else if (difficulty < 2.0) {
            mediumRatio = 0.2;
            hardRatio = 0.8;
        } else {
            hardRatio = 0.5;
            extremeRatio = 0.5;
        }

        const totalWords = 50;
        const easyCount = Math.floor(totalWords * easyRatio);
        const mediumCount = Math.floor(totalWords * mediumRatio);
        const hardCount = Math.floor(totalWords * hardRatio);
        const extremeCount = totalWords - easyCount - mediumCount - hardCount;

        this.words = [
            ...this.getRandomWords(this.wordLists.easy, easyCount),
            ...this.getRandomWords(this.wordLists.medium, mediumCount),
            ...this.getRandomWords(this.wordLists.hard, hardCount),
            ...this.getRandomWords(this.wordLists.extreme, extremeCount)
        ];

        // Shuffle the list
        this.words = this.shuffleArray(this.words);
    }

    getRandomWords(list, count) {
        const shuffled = [...list].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, Math.min(count, shuffled.length));
    }

    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    setupEventListeners() {
        const startBtn = document.getElementById('start-game-btn');
        const resetBtn = document.getElementById('reset-btn');
        const pauseBtn = document.getElementById('pause-btn');
        const gameInput = document.getElementById('game-input');

        startBtn.addEventListener('click', () => this.start());
        resetBtn.addEventListener('click', () => this.reset());
        pauseBtn.addEventListener('click', () => this.togglePause());

        gameInput.addEventListener('input', (e) => this.handleInput(e));
        gameInput.addEventListener('keydown', (e) => this.trackKeyDown(e));
        gameInput.addEventListener('keyup', (e) => this.trackKeyUp(e));

        // Listen for difficulty updates to regenerate word list
        window.addEventListener('difficultyUpdate', () => {
            if (this.isPlaying && this.wordIndex >= this.words.length * 0.8) {
                this.generateWordList();
                this.wordIndex = 0;
            }
        });
    }

    setupKeyboardTracking() {
        // Track keyboard patterns for stress detection
        this.keyboardAnalysisInterval = setInterval(() => {
            if (this.isPlaying && !this.isPaused) {
                this.analyzeKeyboardPatterns();
            }
        }, 2000); // Analyze every 2 seconds
    }

    trackKeyDown(event) {
        if (!this.isPlaying || this.isPaused) return;

        const now = Date.now();
        this.keyboardData.pressTimes.push(now);
        this.keyboardData.totalKeys++;

        if (this.lastKeyTime > 0) {
            const interval = now - this.lastKeyTime;
            this.keyboardData.intervals.push(interval);
        }
        this.lastKeyTime = now;
    }

    trackKeyUp(event) {
        if (!this.isPlaying || this.isPaused) return;

        const now = Date.now();
        this.keyboardData.releaseTimes.push(now);

        if (this.keyboardData.pressTimes.length > 0 && this.keyboardData.releaseTimes.length > 0) {
            const lastPress = this.keyboardData.pressTimes[this.keyboardData.pressTimes.length - 1];
            const lastRelease = this.keyboardData.releaseTimes[this.keyboardData.releaseTimes.length - 1];
            
            if (lastRelease >= lastPress) {
                const duration = lastRelease - lastPress;
                this.keyboardData.pressDurations.push(duration);
            }
        }
    }

    analyzeKeyboardPatterns() {
        if (this.keyboardData.pressDurations.length === 0) return;

        // Calculate average press duration
        const avgPressDuration = this.keyboardData.pressDurations.reduce((a, b) => a + b, 0) / this.keyboardData.pressDurations.length;

        // Calculate speed variance (irregular patterns indicate stress)
        let speedVariance = 0;
        if (this.keyboardData.intervals.length > 1) {
            const avgInterval = this.keyboardData.intervals.reduce((a, b) => a + b, 0) / this.keyboardData.intervals.length;
            const variance = this.keyboardData.intervals.reduce((sum, interval) => {
                return sum + Math.pow(interval - avgInterval, 2);
            }, 0) / this.keyboardData.intervals.length;
            speedVariance = Math.sqrt(variance);
        }

        // Calculate error rate
        const errorRate = this.keyboardData.totalKeys > 0 ? this.keyboardData.errors / this.keyboardData.totalKeys : 0;

        // Send to backend
        this.sendKeyboardStress({
            avg_press_duration: avgPressDuration,
            speed_variance: speedVariance,
            error_rate: errorRate
        });
    }

    async sendKeyboardStress(keyData) {
        try {
            const response = await fetch('/api/keyboard-stress', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    player_id: emotionDetector.getPlayerId(),
                    key_data: keyData
                })
            });

            if (!response.ok) {
                throw new Error('Keyboard stress analysis failed');
            }

            const data = await response.json();
            
            // Emit keyboard stress update
            window.dispatchEvent(new CustomEvent('keyboardStressUpdate', {
                detail: {
                    stress: data.keyboard_stress,
                    avgStress: data.avg_keyboard_stress
                }
            }));

        } catch (error) {
            console.error('Error sending keyboard stress:', error);
        }
    }

    start() {
        if (this.isPlaying) return;

        this.isPlaying = true;
        this.isPaused = false;
        this.score = 0;
        this.level = 1;
        this.wordIndex = 0;
        this.startTime = Date.now();
        this.timeElapsed = 0;
        this.keyboardData = {
            pressTimes: [],
            releaseTimes: [],
            pressDurations: [],
            intervals: [],
            errors: 0,
            totalKeys: 0
        };

        // Show game area
        document.getElementById('start-screen').style.display = 'none';
        document.getElementById('game-active').style.display = 'block';
        document.getElementById('pause-btn').style.display = 'inline-block';

        // Focus input
        const gameInput = document.getElementById('game-input');
        gameInput.focus();
        gameInput.value = '';

        // Start timer
        this.timer = setInterval(() => {
            if (!this.isPaused) {
                this.timeElapsed = Math.floor((Date.now() - this.startTime) / 1000);
                document.getElementById('time').textContent = this.timeElapsed + 's';
            }
        }, 1000);

        // Load first word
        this.loadNextWord();
    }

    loadNextWord() {
        if (this.wordIndex >= this.words.length) {
            this.generateWordList();
            this.wordIndex = 0;
            this.level++;
            document.getElementById('level').textContent = this.level;
        }

        this.currentWord = this.words[this.wordIndex];
        document.getElementById('target-word').textContent = this.currentWord;
        
        const gameInput = document.getElementById('game-input');
        gameInput.value = '';
        gameInput.focus();
        
        document.getElementById('feedback').textContent = '';
        document.getElementById('feedback').className = 'feedback';
    }

    handleInput(event) {
        if (!this.isPlaying || this.isPaused) return;

        const input = event.target.value;
        const target = this.currentWord.toLowerCase();
        const current = input.toLowerCase();

        const feedback = document.getElementById('feedback');

        if (current === target) {
            // Correct word
            this.score += Math.floor(10 * adaptiveSystem.getDifficulty());
            this.wordIndex++;
            
            document.getElementById('score').textContent = this.score;
            feedback.textContent = '✓ Correct!';
            feedback.className = 'feedback correct';

            // Update level based on score
            const newLevel = Math.floor(this.score / 100) + 1;
            if (newLevel > this.level) {
                this.level = newLevel;
                document.getElementById('level').textContent = this.level;
            }

            // Load next word after short delay
            setTimeout(() => {
                if (this.isPlaying && !this.isPaused) {
                    this.loadNextWord();
                }
            }, 500);
        } else if (target.startsWith(current)) {
            // Partial match
            feedback.textContent = '';
            feedback.className = 'feedback';
        } else {
            // Incorrect
            this.keyboardData.errors++;
            feedback.textContent = '✗ Incorrect';
            feedback.className = 'feedback incorrect';
        }
    }

    togglePause() {
        if (!this.isPlaying) return;

        this.isPaused = !this.isPaused;
        const pauseBtn = document.getElementById('pause-btn');
        pauseBtn.textContent = this.isPaused ? 'Resume' : 'Pause';

        const gameInput = document.getElementById('game-input');
        if (this.isPaused) {
            gameInput.blur();
        } else {
            gameInput.focus();
            this.startTime = Date.now() - (this.timeElapsed * 1000);
        }
    }

    reset() {
        this.isPlaying = false;
        this.isPaused = false;
        this.score = 0;
        this.level = 1;
        this.wordIndex = 0;
        this.timeElapsed = 0;

        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }

        // Reset displays
        document.getElementById('start-screen').style.display = 'block';
        document.getElementById('game-active').style.display = 'none';
        document.getElementById('pause-btn').style.display = 'none';
        document.getElementById('score').textContent = '0';
        document.getElementById('level').textContent = '1';
        document.getElementById('time').textContent = '0s';
        document.getElementById('game-input').value = '';

        // Reset backend state
        fetch('/api/reset', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                player_id: emotionDetector.getPlayerId()
            })
        });

        // Reset adaptive system
        adaptiveSystem.reset();
        emotionDetector.reset();
        window.dispatchEvent(new CustomEvent('playerReset'));
    }
}

// Initialize game
const game = new AdaptiveGame();



