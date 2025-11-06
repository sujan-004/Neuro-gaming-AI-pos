# Neuro-Adaptive Gaming AI

An innovative gaming platform where difficulty adapts in real-time based on player's facial expressions and keyboard stress patterns.

## Features

- **Real-time Facial Expression Analysis**: Detects emotions and stress levels through webcam
- **Keyboard Stress Pattern Detection**: Monitors typing patterns and response times
- **Adaptive Difficulty System**: Automatically adjusts game difficulty based on player state
- **Modern Web Interface**: Beautiful, responsive UI with real-time feedback
- **Multi-modal Biometric Analysis**: Combines facial expressions and keyboard patterns for accurate stress detection

## Technology Stack

- **Backend**: Python, Flask, MediaPipe, OpenCV
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **AI/ML**: MediaPipe for facial landmark detection, emotion recognition algorithms

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd "Neuro Adaptive gaming AI"
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

3. Run the application:
```bash
python app.py
```

4. Open your browser and navigate to:
```
http://localhost:5000
```

## Usage

1. **Grant Camera Permission**: Allow browser access to your webcam when prompted
2. **Start Playing**: Click "Start Game" to begin
3. **Monitor Your Stress**: The system will analyze your facial expressions and keyboard patterns
4. **Adaptive Experience**: Game difficulty will automatically adjust based on your stress levels

## How It Works

### Facial Expression Analysis
- Uses MediaPipe to detect facial landmarks
- Analyzes facial muscle movements to determine stress/emotion levels
- Tracks changes in facial expressions over time

### Keyboard Stress Detection
- Monitors typing patterns and response times
- Detects irregular typing rhythms (indicating stress)
- Analyzes key press duration and intervals

### Adaptive Difficulty Algorithm
- Combines facial expression and keyboard stress data
- Calculates a composite stress score
- Adjusts game parameters (speed, complexity) in real-time
- Maintains optimal challenge level for engagement

## Project Structure

```
├── app.py                 # Flask backend server
├── static/
│   ├── css/
│   │   └── style.css      # Styling
│   ├── js/
│   │   ├── game.js        # Game logic
│   │   ├── emotion.js     # Emotion detection
│   │   └── adaptive.js    # Adaptive difficulty system
│   └── images/            # Assets
├── templates/
│   └── index.html         # Main game interface
├── requirements.txt       # Python dependencies
└── README.md             # This file
```

## Browser Compatibility

- Chrome/Edge (recommended)
- Firefox
- Safari (with limitations)

## Privacy

- All video processing is done locally in your browser
- No video data is sent to the server
- Only stress level scores are transmitted for game adaptation

## Future Enhancements

- Heart rate detection via webcam
- Machine learning models for improved emotion recognition
- Multiplayer support
- Advanced game modes
- Performance analytics dashboard

## License

This project is open source and available for educational purposes.

## Author

Sujan C - Computer Science Engineer



