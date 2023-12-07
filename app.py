#goal: expose endpoints of ai transformer model 

from flask import Flask, request, jsonify, session
from flask_cors import CORS
# from flask_session import Session
from transformers import AutoModelForAudioClassification, AutoFeatureExtractor
import librosa
import torch
import os
from pydub import AudioSegment
from re import compile as _Re
import pinyin_jyutping_sentence

def create_app():
    app = Flask(__name__)
    app.config['model'] = AutoModelForAudioClassification.from_pretrained("cge7/wav2vec2-base-version3")
    app.config['feature_extractor'] = AutoFeatureExtractor.from_pretrained("cge7/wav2vec2-base-version3")
    # app.secret_key = 'SECRET_KEY'
    # app.config["SESSION_PERMANENT"] = False
    # app.config["SESSION_TYPE"] = "filesystem"
    # Session(app)

    # app.config['tones'] = []
    # app.config['text'] = []
    # app.config['path_to_audio'] = ""
    return app

app = create_app() 
CORS(app)

@app.route("/fetch_audio", methods=["POST"])
def process_audio():
    if request.method == "POST":
        if "audio" not in request.files:
            return jsonify({"error": "No audio file provided"}), 400

        audio_file = request.files.get("audio")
        audio_data = audio_file.read()
        # print(audio_data)
        script_directory = os.path.dirname(os.path.realpath(__file__))
        path_to_audio = os.path.join(script_directory, "recording.wav")
        # session['path_to_audio'] = path_to_audio
        # session.modified = True
        # if 'path_to_audio' not in session:
        #     print("yeah path_to_audio isn't in the session")
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
    if request.method == "POST":
        if not request.json or "breakpoints" not in request.json: # Check if text is sent via JSON
            return jsonify({"error": "No breakpoints provided"}), 400
        breakpoints = request.json["breakpoints"]
        # print(return_list)
        breakpoints.insert(0, 0)
        # if 'path_to_audio' not in session:
        #     print("something fucked up in between")
        path_to_audio = request.json['path_to_audio']
        print(path_to_audio)
        audio = AudioSegment.from_file(path_to_audio)
        print("got the audio loaded")
        predicted_labels = []
        for i in range(len(breakpoints)-1):
            print(f"processing syllable {i}")
            start_time = breakpoints[i]*1000
            end_time = breakpoints[i+1]*1000
            cut_audio = audio[start_time:end_time]
            syllable_path = f"./public/syllables/chunk{i}.wav"
            with open(syllable_path, "w") as f:
                f.write("")
            print(f"wrote sylalble {i}")
            cut_audio.export(syllable_path, format="wav")
            return jsonify({"result": "returns before the model evaluation"}), 200
            predicted_labels.append(evaluate_model(syllable_path))
            
        print("finished processing syllables")
        tones = request.json["tones"]
        return_list = []
        for pred, tone in zip(predicted_labels, tones):
            correctness = int(pred) == int(tone)
            return_list.append({"prediction": int(pred), "correctness": correctness, "expected": int(tone)})
        print("get to return statement")
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
        


@app.route("/healthz", methods=["GET"])
def health_check():
    print("health checks")
    return jsonify({"response": "OK"}), 200


def evaluate_model(path_to_audio):
    model = app.config['model']
    feature_extractor = app.config['feature_extractor']
    wav_chunk, rate = librosa.load(path_to_audio, sr=16000)
    input_values = feature_extractor(wav_chunk, sampling_rate=rate, return_tensors = "pt").input_values
    os.environ["TORCH_USE_NNPACK"] = "0"
    logits = model(input_values).logits
    del os.environ["TORCH_USE_NNPACK"]
    
    return torch.argmax(logits, dim=-1).item()



if __name__ == "__main__":
    # root = logging.getLogger()
    # root.setLevel(logging.INFO)
    # handler = logging.StreamHandler(sys.stdout)
    # handler.setLevel(logging.INFO)
    # formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    # handler.setFormatter(formatter)
    # app.logger.setHandler(handler)
    # logging.basicConfig(level=logging.DEBUG)
    # logging.info('This is an info message')

    # app.logger.info(os.environ.get("RENDER_EXTERNAL_HOSTNAME"))
    # for rule in app.url_map.iter_rules():
    #     app.logger.info(f"Running on {rule.endpoint} ({rule.methods}): {rule.rule}")
    # app.logger.setLevel(logging.INFO)
    # app.logger.info("hello world")
    # print("printed hello world")
    port = int(os.environ.get("PORT", 10000))
    app.run(debug=True, host='0.0.0.0', port=port)  
    
