#goal: expose endpoints of ai transformer model 

from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import AutoModelForAudioClassification, AutoFeatureExtractor
import librosa
import torch
import os
from pydub import AudioSegment
from re import compile as _Re
import pinyin_jyutping_sentence
from logging.config import dictConfig

dictConfig({
    'version': 1,
    'formatters': {'default': {
        'format': '[%(asctime)s] %(levelname)s in %(module)s: %(message)s',
    }},
    'handlers': {'wsgi': {
        'class': 'logging.StreamHandler',
        'stream': 'ext://flask.logging.wsgi_errors_stream',
        'formatter': 'default'
    }},
    'root': {
        'level': 'INFO',
        'handlers': ['wsgi']
    }
})

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": ["https://tone-me.onrender.com/", "http://localhost:10000"]}})
@app.route('/')
def hello_world():
    return 'Hello, World!'

@app.route("/fetch_audio", methods=["POST"])
def process_audio():
    if request.method == "POST":
        if "audio" not in request.files:
            return jsonify({"error": "No audio file provided"}), 400

        audio_file = request.files.get("audio")
        audio_data = audio_file.read()

        global path_to_audio
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

        return jsonify({"path": path_to_audio}), 200

@app.route("/predict_audio", methods=["POST"])
def predict_audio():
    if not request.json or "breakpoints" not in request.json: # Check if text is sent via JSON
        return jsonify({"error": "No breakpoints provided"}), 400
    breakpoints = request.json["breakpoints"]
    # print(return_list)
    breakpoints.insert(0, 0)
    audio = AudioSegment.from_file(path_to_audio)
    predicted_labels = []
    for i in range(len(breakpoints)-1):
        start_time = breakpoints[i]*1000
        end_time = breakpoints[i+1]*1000
        cut_audio = audio[start_time:end_time]
        syllable_path = f"../public/syllables/chunk{i}.wav"
        with open(syllable_path, "w") as f:
             f.write("")
        cut_audio.export(syllable_path, format="wav")
        predicted_labels.append(evaluate_model(syllable_path))
    global tones
    return_list = []
    for pred, tone in zip(predicted_labels, tones):
        correctness = int(pred) == int(tone)
        return_list.append({"prediction": int(pred), "correctness": correctness, "expected": int(tone)})

    return jsonify({"result": return_list}), 200

def parse(string):
    res = []
    for char in string:
        if char != ' ':
            res.append(char)
    return res
            

_unicode_chr_splitter = _Re( '(?s)((?:[\ud800-\udbff][\udc00-\udfff])|.)' ).split

def split_unicode_chrs( text ):
  return [ chr for chr in _unicode_chr_splitter( text ) if chr]

def extract_tones(text):
	result = pinyin_jyutping_sentence.pinyin(text, tone_numbers=True)
	ans = []
	for letter in result:
		if letter in ['1', '2', '3', '4', '5']:
			ans.append(letter)
	return ans

@app.route("/fetch_text", methods=["POST"])
def process_text():
    if request.method == "POST":
        if not request.json or "text" not in request.json: # Check if text is sent via JSON
            return jsonify({"error": "No text provided"}), 400
        global text
        global tones 
        if request.json["tones"]:
             tones = parse(request.json["tones"])
        else:
             tones = extract_tones(request.json["text"])
        text = split_unicode_chrs(request.json["text"])
        
        response = jsonify({
             "text": text,
             "tones": tones
        })
        return response
        
def evaluate_model(path_to_audio):
    global model 
    global feature_extractor

    wav_chunk, rate = librosa.load(path_to_audio, sr=16000)
    input_values = feature_extractor(wav_chunk, sampling_rate=rate, return_tensors = "pt").input_values
    os.environ["TORCH_USE_NNPACK"] = "0"
    logits = model(input_values).logits
    del os.environ["TORCH_USE_NNPACK"]
    
    return torch.argmax(logits, dim=-1).item()

'root': {
    'level': 'INFO',
    'handlers': ['wsgi']
}
app.logger.info(os.environ.get("hello world"))

if __name__ == "__main__":
    app.logger.info(os.environ.get("RENDER_EXTERNAL_HOSTNAME"))
    for rule in app.url_map.iter_rules():
        app.logger.info(f"Running on {rule.endpoint} ({rule.methods}): {rule.rule}")
    print('hello world', flush=True)
    app.logger.info("hello world")
    model_name = "cge7/wav2vec2-base-version3"
    model = AutoModelForAudioClassification.from_pretrained(model_name)
    feature_extractor = AutoFeatureExtractor.from_pretrained(model_name)
    script_directory = os.path.dirname(os.path.realpath(__file__))
    path_to_audio = os.path.join(script_directory, "../public/7#yao!1.wav")
    sample_audio, sample_rate = librosa.load(path_to_audio)
    text = []
    tones = []
    path_to_audio = "./recording.wav"
    # print(sample_audio)
    # print(evaluate_model(audio=audio, rate=rate, model=model, feature_extractor=feature_extractor))
    port = int(os.environ.get("PORT", 10000))
    app.run(host='0.0.0.0', port=port)
