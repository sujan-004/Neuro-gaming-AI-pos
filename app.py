from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import cv2
import mediapipe as mp
import numpy as np
import base64
import io
from PIL import Image
import json
import random

app = Flask(__name__)
CORS(app)

# Initialize MediaPipe
mp_face_mesh = mp.solutions.face_mesh
mp_drawing = mp.solutions.drawing_utils
face_mesh = mp_face_mesh.FaceMesh(
    max_num_faces=1,
    refine_landmarks=True,
    min_detection_confidence=0.5,
    min_tracking_confidence=0.5
)

# Store player state
player_states = {}

def analyze_facial_expression(landmarks, image_shape):
    """Analyze facial landmarks to determine stress/emotion level"""
    if not landmarks:
        return 0.5  # Neutral
    
    try:
        # Get image dimensions
        h, w = image_shape[:2]
        
        # Extract all landmark points (MediaPipe returns normalized coordinates)
        points = []
        for landmark in landmarks.landmark:
            x = landmark.x * w
            y = landmark.y * h
            z = landmark.z * w  # Depth
            points.append((x, y, z))
        
        # Calculate facial metrics using general regions
        # Find bounding box of face
        x_coords = [p[0] for p in points]
        y_coords = [p[1] for p in points]
        face_width = max(x_coords) - min(x_coords)
        face_height = max(y_coords) - min(y_coords)
        face_center_x = (max(x_coords) + min(x_coords)) / 2
        face_center_y = (max(y_coords) + min(y_coords)) / 2
        
        # Estimate stress based on facial geometry
        # More variance in landmark positions = more facial movement = potential stress
        stress_score = 0.5  # Start neutral
        
        # Calculate variance in landmark positions (facial movement)
        x_variance = np.var([p[0] for p in points])
        y_variance = np.var([p[1] for p in points])
        z_variance = np.var([p[2] for p in points])
        
        # Normalize variances (these are pixel-based, so scale appropriately)
        normalized_x_var = min(x_variance / (w * w * 0.01), 1.0)
        normalized_y_var = min(y_variance / (h * h * 0.01), 1.0)
        normalized_z_var = min(z_variance / (w * w * 0.01), 1.0)
        
        # Higher variance = more movement = higher potential stress
        movement_stress = (normalized_x_var + normalized_y_var + normalized_z_var) / 3.0
        
        # Calculate face aspect ratio (stress can affect facial shape)
        aspect_ratio = face_height / (face_width + 1)
        # Normal faces typically have aspect ratio around 1.2-1.5
        # Extreme values might indicate stress
        if aspect_ratio < 1.0 or aspect_ratio > 2.0:
            aspect_stress = 0.3
        else:
            aspect_stress = 0.0
        
        # Combine metrics
        stress_score = movement_stress * 0.7 + aspect_stress * 0.3
        
        # Add some randomness to make it more dynamic (simulate real stress detection)
        noise = random.uniform(-0.1, 0.1)
        stress_score += noise
        
        # Clamp between 0 and 1
        stress_score = max(0.0, min(1.0, stress_score))
        
        return stress_score
        
    except Exception as e:
        print(f"Error analyzing face: {e}")
        import traceback
        traceback.print_exc()
        return 0.5  # Return neutral on error

@app.route('/')
def index():
    """Serve the main game page"""
    return render_template('index.html')

@app.route('/api/analyze-face', methods=['POST'])
def analyze_face():
    """Analyze facial expression from image data"""
    try:
        data = request.json
        image_data = data.get('image')
        
        if not image_data:
            return jsonify({'error': 'No image data provided'}), 400
        
        # Remove data URL prefix if present
        if ',' in image_data:
            image_data = image_data.split(',')[1]
        
        # Decode base64 image
        image_bytes = base64.b64decode(image_data)
        image = Image.open(io.BytesIO(image_bytes))
        image_np = np.array(image)
        
        # Convert RGB to BGR for OpenCV
        image_bgr = cv2.cvtColor(image_np, cv2.COLOR_RGB2BGR)
        image_rgb = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2RGB)
        
        # Process with MediaPipe
        results = face_mesh.process(image_rgb)
        
        stress_score = 0.5  # Default neutral
        face_detected = False
        
        if results.multi_face_landmarks:
            face_detected = True
            landmarks = results.multi_face_landmarks[0]
            stress_score = analyze_facial_expression(landmarks, image_rgb.shape)
        
        # Get or create player state
        player_id = data.get('player_id', 'default')
        if player_id not in player_states:
            player_states[player_id] = {
                'stress_history': [],
                'difficulty': 1.0,
                'face_detected': False
            }
        
        # Update player state
        player_states[player_id]['stress_history'].append(stress_score)
        if len(player_states[player_id]['stress_history']) > 10:
            player_states[player_id]['stress_history'].pop(0)
        
        player_states[player_id]['face_detected'] = face_detected
        
        # Calculate average stress over recent history
        avg_stress = np.mean(player_states[player_id]['stress_history']) if player_states[player_id]['stress_history'] else 0.5
        
        return jsonify({
            'stress_score': float(stress_score),
            'avg_stress': float(avg_stress),
            'face_detected': face_detected,
            'difficulty': player_states[player_id]['difficulty']
        })
        
    except Exception as e:
        print(f"Error in analyze_face: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/keyboard-stress', methods=['POST'])
def keyboard_stress():
    """Analyze keyboard stress patterns"""
    try:
        data = request.json
        player_id = data.get('player_id', 'default')
        key_data = data.get('key_data', {})
        
        if player_id not in player_states:
            player_states[player_id] = {
                'stress_history': [],
                'keyboard_history': [],
                'difficulty': 1.0
            }
        
        # Analyze keyboard patterns
        # Irregular typing patterns, longer key presses, faster typing = stress
        stress_from_keys = 0.5  # Default neutral
        
        if key_data:
            # Key press duration (longer = more stress)
            avg_press_duration = key_data.get('avg_press_duration', 0)
            if avg_press_duration > 0:
                # Normalize: 100ms = 0.0, 500ms+ = 1.0
                duration_stress = min((avg_press_duration - 100) / 400.0, 1.0)
                duration_stress = max(0.0, duration_stress)
                stress_from_keys += duration_stress * 0.3
            
            # Typing speed variance (irregular = stress)
            speed_variance = key_data.get('speed_variance', 0)
            if speed_variance > 0:
                variance_stress = min(speed_variance / 100.0, 1.0)
                stress_from_keys += variance_stress * 0.3
            
            # Error rate (more errors = stress)
            error_rate = key_data.get('error_rate', 0)
            if error_rate > 0:
                error_stress = min(error_rate, 1.0)
                stress_from_keys += error_stress * 0.4
        
        # Clamp between 0 and 1
        stress_from_keys = max(0.0, min(1.0, stress_from_keys))
        
        # Update keyboard history
        player_states[player_id].setdefault('keyboard_history', []).append(stress_from_keys)
        if len(player_states[player_id]['keyboard_history']) > 10:
            player_states[player_id]['keyboard_history'].pop(0)
        
        return jsonify({
            'keyboard_stress': float(stress_from_keys),
            'avg_keyboard_stress': float(np.mean(player_states[player_id]['keyboard_history'])) if player_states[player_id]['keyboard_history'] else 0.5
        })
        
    except Exception as e:
        print(f"Error in keyboard_stress: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/update-difficulty', methods=['POST'])
def update_difficulty():
    """Update game difficulty based on combined stress indicators"""
    try:
        data = request.json
        player_id = data.get('player_id', 'default')
        facial_stress = data.get('facial_stress', 0.5)
        keyboard_stress = data.get('keyboard_stress', 0.5)
        
        if player_id not in player_states:
            player_states[player_id] = {
                'stress_history': [],
                'difficulty': 1.0
            }
        
        # Combine stress indicators (weighted average)
        combined_stress = (facial_stress * 0.6 + keyboard_stress * 0.4)
        
        # Adaptive difficulty algorithm
        # Higher stress = lower difficulty (easier game)
        # Lower stress = higher difficulty (harder game)
        # Target: keep player in moderate stress zone (0.4-0.6)
        
        current_difficulty = player_states[player_id]['difficulty']
        
        if combined_stress > 0.7:  # Very stressed
            # Reduce difficulty significantly
            new_difficulty = current_difficulty * 0.9
        elif combined_stress > 0.6:  # Stressed
            # Reduce difficulty slightly
            new_difficulty = current_difficulty * 0.95
        elif combined_stress < 0.3:  # Very relaxed
            # Increase difficulty significantly
            new_difficulty = current_difficulty * 1.1
        elif combined_stress < 0.4:  # Relaxed
            # Increase difficulty slightly
            new_difficulty = current_difficulty * 1.05
        else:  # Optimal zone (0.4-0.6)
            # Maintain current difficulty
            new_difficulty = current_difficulty
        
        # Clamp difficulty between 0.5 and 3.0
        new_difficulty = max(0.5, min(3.0, new_difficulty))
        
        player_states[player_id]['difficulty'] = new_difficulty
        
        return jsonify({
            'difficulty': float(new_difficulty),
            'combined_stress': float(combined_stress),
            'recommendation': 'increase' if combined_stress < 0.4 else 'decrease' if combined_stress > 0.6 else 'maintain'
        })
        
    except Exception as e:
        print(f"Error in update_difficulty: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/reset', methods=['POST'])
def reset():
    """Reset player state"""
    try:
        data = request.json
        player_id = data.get('player_id', 'default')
        
        if player_id in player_states:
            player_states[player_id] = {
                'stress_history': [],
                'keyboard_history': [],
                'difficulty': 1.0,
                'face_detected': False
            }
        
        return jsonify({'status': 'reset'})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("Starting Neuro-Adaptive Gaming AI Server...")
    print("Open http://localhost:5000 in your browser")
    app.run(debug=True, host='0.0.0.0', port=5000)

