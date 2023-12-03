#goal: expose endpoints of ai transformer model 

from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import AutoModelForAudioClassification, AutoFeatureExtractor
import librosa
import torch
import os
from pydub import AudioSegment
from pydub.silence import split_on_silence
from re import compile as _Re
import pinyin_jyutping_sentence

app = Flask(__name__)
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
        # path_to_audio2 = os.path.join(script_directory, "recording2.wav")
        # Set metadata for the WAV file
        # channels = 2
        # sample_width = 2
        # sample_rate = 48000 
            
        with open(path_to_audio, "wb") as f:
            f.write(audio_data)
        #print(path_to_audio)
        preds = evaluate_model(path_to_audio)
        print(preds, tones)
        return_list = []
        for pred, tone in zip(preds, tones):
            correctness = int(pred) == int(tone)
            return_list.append({"prediction": int(pred), "correctness": correctness, "expected": int(tone)})
        # print(return_list)
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
    
    audio = AudioSegment.from_file(path_to_audio)
    chunks = split_on_silence(audio, min_silence_len=100, silence_thresh=-30)
    predicted_labels = []
    for i, chunk in enumerate(chunks):
        # script_directory = os.path.dirname(os.path.realpath(__file__))
        # path_to_cur_audio = os.path.join(script_directory, f"")
        # os.makedirs(os.path.dirname(path_to_cur_audio), exist_ok=True)
        with open(f"./syllables/chunk{i}.wav", "w") as f:
             f.write("")
        
        chunk.export(f"./syllables/chunk{i}.wav", format = "wav")
        
        wav_chunk, rate = librosa.load(f"./syllables/chunk{i}.wav", sr=16000)
        input_values = feature_extractor(wav_chunk, sampling_rate=rate, return_tensors = "pt").input_values
        os.environ["TORCH_USE_NNPACK"] = "0"
        logits = model(input_values).logits
        del os.environ["TORCH_USE_NNPACK"]
        predicted_label = torch.argmax(logits, dim=-1).item()
        predicted_labels.append(predicted_label)
    return predicted_labels
    

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
