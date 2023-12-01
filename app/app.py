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
        print(request.files)
        if 'audio' not in request.files:
            return jsonify({'error': 'No audio file provided'}), 400

        audio_file = request.files.get('audio')
        audio_data = audio_file.read()
        with open('audio.wav', 'wb') as f:
            f.write(audio_data)

        return jsonify({'success': 'Audio file received and processed'}), 200


def evaluate_model(audio, rate, model, feature_extractor):
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
    audio, rate = librosa.load(path_to_audio, sr=16000)
    # print(evaluate_model(audio=audio, rate=rate, model=model, feature_extractor=feature_extractor))
    app.run(debug=True)