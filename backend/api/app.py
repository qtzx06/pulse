import os
import uuid
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import sys

# Add the backend directory to the Python path to enable module imports
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from conductor.agent import SongStructureAgent
from orchestra.music_generator import MusicGenerator
from stitcher.audio_stitcher import AudioStitcher

app = Flask(__name__)
CORS(app)

# --- Configuration ---
# Get the absolute path of the 'backend' directory by going up one level from app.py's location
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UPLOAD_FOLDER = os.path.join(backend_dir, 'uploads')
GENERATED_FOLDER = os.path.join(backend_dir, 'generated')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(GENERATED_FOLDER, exist_ok=True)

# --- Initialize Backend Components ---
try:
    agent = SongStructureAgent()
    generator = MusicGenerator()
    stitcher = AudioStitcher()
    print("Backend components initialized successfully.")
except ValueError as e:
    print(f"FATAL: Error initializing backend components: {e}")
    print("Please ensure your GOOGLE_API_KEY and REPLICATE_API_TOKEN are set in a .env file in the 'backend' directory.")
    agent = None
    generator = None
    stitcher = None

@app.route('/generate', methods=['POST'])
def generate_song():
    """
    Main endpoint to generate a full song from a user's hum and vibe.
    """
    if not all([agent, generator, stitcher]):
        return jsonify({"error": "Backend components not initialized. Check server logs for API key issues."}), 500

    if 'hum_audio' not in request.files:
        return jsonify({"error": "No 'hum_audio' file part in the request."}), 400

    hum_audio_file = request.files['hum_audio']
    hum_description = request.form.get('hum_description', 'a user-provided hummed melody')
    vibe = request.form.get('vibe', 'an interesting and cool vibe')

    # --- 1. Save the uploaded hum ---
    # Use a unique ID for all files related to this request
    request_id = str(uuid.uuid4())
    hum_filename = f"{request_id}_hum.wav"
    hum_path = os.path.join(UPLOAD_FOLDER, hum_filename)
    hum_audio_file.save(hum_path)
    print(f"[{request_id}] Received hum and vibe: '{vibe}'")

    # --- 2. Generate song structure ---
    print(f"[{request_id}] Generating song structure...")
    song_structure = agent.generate_structure(hum_description, vibe)
    if not song_structure or "song_structure" not in song_structure:
        os.remove(hum_path) # Clean up
        return jsonify({"error": "Failed to generate a valid song structure from the LLM."}), 500

    # --- 3. Generate and download each audio segment ---
    segment_paths = []
    is_first_segment = True

    for i, segment in enumerate(song_structure["song_structure"]):
        print(f"[{request_id}] Generating segment {i+1}/{len(song_structure['song_structure'])}: {segment['segment_type']}")
        
        # The 'stereo-melody-large' model uses the original hum as the melodic input for all segments.
        # The 'continuation' flag tells the model to make the new segment flow from the previous one.
        music_url = generator.generate_music_segment(
            prompt=segment['prompt'],
            input_audio_path=hum_path,
            duration=15,  # Increased duration for better segments
            continuation=not is_first_segment
        )

        if not music_url:
            # Clean up all previously generated files and abort
            for path in segment_paths: os.remove(path)
            os.remove(hum_path)
            return jsonify({"error": f"Failed to generate audio for segment {i+1}."}), 500

        # Download the generated segment
        segment_filename = f"{request_id}_segment_{i+1}.wav"
        segment_path = os.path.join(GENERATED_FOLDER, segment_filename)
        print(f"[{request_id}] Downloading segment {i+1} from {music_url}")
        download_success = stitcher.download_audio(music_url, segment_path)

        if not download_success:
            # Clean up and abort
            for path in segment_paths: os.remove(path)
            os.remove(hum_path)
            return jsonify({"error": f"Failed to download generated audio for segment {i+1}."}), 500
            
        segment_paths.append(segment_path)
        is_first_segment = False

    # --- 4. Stitch segments together ---
    print(f"[{request_id}] Stitching {len(segment_paths)} audio segments...")
    stitched_filename = f"final_song_{request_id}.wav"
    stitched_path = os.path.join(GENERATED_FOLDER, stitched_filename)
    stitcher.stitch_audio(segment_paths, stitched_path, crossfade_duration_ms=150)

    # --- 5. Clean up temporary segment files ---
    print(f"[{request_id}] Cleaning up temporary files...")
    for path in segment_paths:
        os.remove(path)
    os.remove(hum_path)

    # --- 6. Return the final song ---
    print(f"[{request_id}] Sending final song to user.")
    return send_file(
        stitched_path,
        as_attachment=True,
        download_name='pulse_generated_song.wav',
        mimetype='audio/wav'
    )

if __name__ == '__main__':
    print("Starting Pulse backend server...")
    print("API endpoint available at http://127.0.0.1:5001/generate")
    app.run(debug=True, port=5001)
