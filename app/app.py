#goal: expose endpoints of ai transformer model 

from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import AutoModelForAudioClassification, AutoFeatureExtractor
import librosa
import torch
import os


app = Flask(__name__)
CORS(app)

@app.route('/fetch_audio', methods=['POST'])
def process_audio():
    if request.method == "POST":
        if 'audio' not in request.files:
            return jsonify({'error': 'No audio file provided'}), 400

        audio_file = request.files.get('audio')
        audio_data = audio_file.read()

        # print(audio_data)
        script_directory = os.path.dirname(os.path.realpath(__file__))
        path_to_audio = os.path.join(script_directory, "recording.wav")
        # path_to_audio2 = os.path.join(script_directory, "recording2.wav")
        # Set metadata for the WAV file
        # channels = 2
        # sample_width = 2
        # sample_rate = 48000 
            
        with open(path_to_audio, "wb") as f:
            f.write(audio_data)
        #print(path_to_audio)
        pred = evaluate_model(path_to_audio)
        correctness = int(pred) == int(text) 
        return jsonify({'prediction': pred, 'correctness': correctness, "expected": text}), 200


@app.route('/fetch_text', methods=['POST'])
def process_text():
    if request.method == "POST":
        if not request.json or 'text' not in request.json: # Check if text is sent via JSON
            return jsonify({'error': 'No text provided'}), 400
        global text
        text = request.json['text']
        response = jsonify({'text': "Successfully handled"})
        return response
        
def evaluate_model(path_to_audio):
    global model 
    global feature_extractor
    
    audio, rate = librosa.load(path_to_audio, sr=16000)
    input_values = feature_extractor(audio, sampling_rate=rate, return_tensors = "pt").input_values
    os.environ['TORCH_USE_NNPACK'] = '0'
    logits = model(input_values).logits
    del os.environ['TORCH_USE_NNPACK']
    predicted_label = torch.argmax(logits, dim=-1).item()
    return predicted_label

if __name__ == "__main__":
    model_name = "cge7/wav2vec2-base-version3"
    model = AutoModelForAudioClassification.from_pretrained(model_name)
    feature_extractor = AutoFeatureExtractor.from_pretrained(model_name)
    script_directory = os.path.dirname(os.path.realpath(__file__))
    path_to_audio = os.path.join(script_directory, "../public/7#yao!1.wav")
    sample_audio, sample_rate = librosa.load(path_to_audio)
    text = ""
    # print(sample_audio)
    # print(evaluate_model(audio=audio, rate=rate, model=model, feature_extractor=feature_extractor))
    app.run(debug=True)