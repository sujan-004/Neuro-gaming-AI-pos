# Quick Setup Guide

## Prerequisites

- Python 3.8 or higher
- pip (Python package manager)
- Webcam
- Modern web browser (Chrome, Edge, Firefox recommended)

## Installation Steps

### Windows

1. **Open Command Prompt or PowerShell** in the project directory

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the application:**
   ```bash
   python app.py
   ```
   
   Or simply double-click `run.bat`

4. **Open your browser** and navigate to:
   ```
   http://localhost:5000
   ```

### Linux/Mac

1. **Open Terminal** in the project directory

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the application:**
   ```bash
   python app.py
   ```
   
   Or make `run.sh` executable and run it:
   ```bash
   chmod +x run.sh
   ./run.sh
   ```

4. **Open your browser** and navigate to:
   ```
   http://localhost:5000
   ```

## First Run Instructions

1. **Grant Camera Permission**: When you first open the app, click "Enable Camera" and allow browser access to your webcam.

2. **Start the Game**: Once the camera is active, click "Start Game"

3. **Play**: Type the words that appear on screen. The game will automatically adjust difficulty based on your facial expressions and typing patterns.

## Troubleshooting

### Camera Not Working
- Ensure you've granted camera permissions in your browser
- Check that no other application is using the camera
- Try refreshing the page and granting permissions again

### Dependencies Installation Issues
- Make sure you're using Python 3.8+
- Try upgrading pip: `python -m pip install --upgrade pip`
- On Windows, you might need to use `python -m pip install -r requirements.txt`

### Port Already in Use
- If port 5000 is busy, modify `app.py` and change the port:
  ```python
  app.run(debug=True, host='0.0.0.0', port=5001)  # Change 5000 to 5001
  ```

### Face Not Detected
- Ensure good lighting
- Face the camera directly
- Remove glasses or adjust lighting if having issues
- The system will still work with keyboard stress patterns if face detection fails

## Features Overview

### Real-Time Analysis
- **Facial Stress**: Analyzes facial muscle movements and expressions
- **Keyboard Stress**: Monitors typing patterns, speed, and errors
- **Combined Score**: Weighted combination of both metrics

### Adaptive Difficulty
- **Easy Mode**: Activates when stress levels are high (>0.7)
- **Normal Mode**: Default difficulty for moderate stress (0.4-0.6)
- **Hard Mode**: Activates when stress is low (<0.4)
- **Dynamic Adjustment**: Changes in real-time as you play

### Game Features
- **Scoring System**: Points increase with difficulty level
- **Level Progression**: Levels increase based on score
- **Real-Time Feedback**: Instant visual feedback on your performance
- **Stress Visualization**: Live charts showing your stress patterns

## Browser Compatibility

✅ **Recommended**: Chrome, Edge (Chromium)  
✅ **Supported**: Firefox, Safari  
⚠️ **Limited**: Older browsers may have reduced functionality

## Performance Tips

- Close other applications using the camera
- Ensure good internet connection (for initial setup)
- Use a well-lit environment for better face detection
- Keep your face centered in the camera view

## Privacy & Security

- All video processing happens locally in your browser
- No video data is sent to external servers
- Only stress level scores are transmitted to the local Flask server
- All data stays on your machine

## Need Help?

If you encounter any issues:
1. Check the browser console for errors (F12)
2. Check the terminal/command prompt for server errors
3. Ensure all dependencies are installed correctly
4. Try restarting the application

## Next Steps

After getting it running:
1. Experiment with different stress levels
2. Observe how the game adapts to your state
3. Try to maintain optimal stress levels for best performance
4. Explore the real-time metrics and charts

Enjoy your Neuro-Adaptive Gaming experience! 🎮🧠




