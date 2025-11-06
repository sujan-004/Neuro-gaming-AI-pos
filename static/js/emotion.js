// Emotion Detection and Facial Analysis
class EmotionDetector {
    constructor() {
        this.video = document.getElementById('video');
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.stream = null;
        this.isRunning = false;
        this.analysisInterval = null;
        this.playerId = 'player_' + Date.now();
        this.lastAnalysisTime = 0;
    }

    async startCamera() {
        try {
            const constraints = {
                video: {
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                    facingMode: 'user'
                }
            };

            this.stream = await navigator.mediaDevices.getUserMedia(constraints);
            this.video.srcObject = this.stream;
            
            await new Promise((resolve) => {
                this.video.onloadedmetadata = () => {
                    this.canvas.width = this.video.videoWidth;
                    this.canvas.height = this.video.videoHeight;
                    resolve();
                };
            });

            this.isRunning = true;
            this.updateCameraStatus(true);
            this.startAnalysis();
            
            return true;
        } catch (error) {
            console.error('Error accessing camera:', error);
            alert('Unable to access camera. Please grant camera permissions.');
            this.updateCameraStatus(false);
            return false;
        }
    }

    stopCamera() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
        this.isRunning = false;
        this.updateCameraStatus(false);
        if (this.analysisInterval) {
            clearInterval(this.analysisInterval);
            this.analysisInterval = null;
        }
    }

    updateCameraStatus(active) {
        const statusIndicator = document.getElementById('camera-status');
        const statusDot = statusIndicator.querySelector('.status-dot');
        const statusText = statusIndicator.querySelector('span:last-child');
        
        if (active) {
            statusDot.classList.add('active');
            statusText.textContent = 'Camera Active';
        } else {
            statusDot.classList.remove('active');
            statusText.textContent = 'Camera Offline';
        }
    }

    captureFrame() {
        if (!this.isRunning || this.video.readyState !== this.video.HAVE_ENOUGH_DATA) {
            return null;
        }

        this.ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
        return this.canvas.toDataURL('image/jpeg', 0.8);
    }

    async analyzeFace() {
        const now = Date.now();
        // Throttle to ~2 FPS to reduce server load
        if (now - this.lastAnalysisTime < 500) {
            return;
        }
        this.lastAnalysisTime = now;

        const imageData = this.captureFrame();
        if (!imageData) return;

        try {
            const response = await fetch('/api/analyze-face', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    image: imageData,
                    player_id: this.playerId
                })
            });

            if (!response.ok) {
                throw new Error('Analysis failed');
            }

            const data = await response.json();
            this.updateFacialMetrics(data);
            return data;
        } catch (error) {
            console.error('Error analyzing face:', error);
            return null;
        }
    }

    updateFacialMetrics(data) {
        const stressScore = data.stress_score || 0.5;
        const avgStress = data.avg_stress || 0.5;
        const faceDetected = data.face_detected || false;

        // Update facial stress display
        const facialStressElement = document.getElementById('facial-stress');
        const facialStressBar = document.getElementById('facial-stress-bar');
        
        if (facialStressElement) {
            facialStressElement.textContent = stressScore.toFixed(2);
        }
        
        if (facialStressBar) {
            facialStressBar.style.width = (stressScore * 100) + '%';
        }

        // Update face detection status
        if (!faceDetected && this.isRunning) {
            console.warn('Face not detected in frame');
        }

        // Emit event for other components
        window.dispatchEvent(new CustomEvent('facialStressUpdate', {
            detail: {
                stress: stressScore,
                avgStress: avgStress,
                faceDetected: faceDetected
            }
        }));
    }

    startAnalysis() {
        if (this.analysisInterval) {
            clearInterval(this.analysisInterval);
        }

        // Analyze every 500ms (2 FPS)
        this.analysisInterval = setInterval(() => {
            if (this.isRunning) {
                this.analyzeFace();
            }
        }, 500);
    }

    getPlayerId() {
        return this.playerId;
    }

    reset() {
        this.playerId = 'player_' + Date.now();
    }
}

// Initialize emotion detector
const emotionDetector = new EmotionDetector();

// Camera button handler
document.getElementById('start-camera-btn').addEventListener('click', async () => {
    const btn = document.getElementById('start-camera-btn');
    if (emotionDetector.isRunning) {
        emotionDetector.stopCamera();
        btn.textContent = 'Enable Camera';
        document.getElementById('start-game-btn').disabled = true;
    } else {
        btn.textContent = 'Starting...';
        btn.disabled = true;
        const success = await emotionDetector.startCamera();
        btn.disabled = false;
        if (success) {
            btn.textContent = 'Disable Camera';
            document.getElementById('start-game-btn').disabled = false;
        } else {
            btn.textContent = 'Enable Camera';
        }
    }
});



