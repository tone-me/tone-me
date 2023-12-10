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
import requests

# the API of the inference mode of my huggingface model so that we can call to the model 
API_URL = "https://api-inference.huggingface.co/models/cge7/wav2vec2-base-version3" 
headers = {"Authorization": "Bearer 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"}


def create_app():
    app = Flask(__name__)

    # save the model and the feature extractor in app so that it can be used globally across API calls
    app.config['model'] = AutoModelForAudioClassification.from_pretrained("cge7/wav2vec2-base-version3")
    app.config['feature_extractor'] = AutoFeatureExtractor.from_pretrained("cge7/wav2vec2-base-version3")
    return app

app = create_app() 
CORS(app)

@app.route("/fetch_audio", methods=["POST"])
def process_audio():
    if request.method == "POST":
        if "audio" not in request.files:
            return jsonify({"error": "No audio file provided"}), 400

        # get the audio data from the frontend 
        audio_file = request.files.get("audio")
        audio_data = audio_file.read()

        # save the audio in a file recording.wav
        script_directory = os.path.dirname(os.path.realpath(__file__))
        path_to_audio = os.path.join(script_directory, "recording.wav")

        # Set metadata for the WAV file
        # channels = 2
        # sample_width = 2
        # sample_rate = 48000 
        # our current data is headerless, but trying to manually create headers just caused the resulting file to be static
        # fortunately, with ffmpeg installed, it can automatically infer the headers or something 


        with open(path_to_audio, "wb") as f:
            f.write(audio_data)
    
        return jsonify({"path": path_to_audio}), 200

@app.route("/predict_audio", methods=["POST"])
def predict_audio():
    if request.method == "POST":
        production = False # if it's deployed on Render, for some reason calling the model directly hangs the process forever, so I make an API call to huggingface instead
        if not request.json or "breakpoints" not in request.json: # Check if text is sent via JSON
            return jsonify({"error": "No breakpoints provided"}), 400
        
        # get the syllable breakpoint timestamps from the request, as well as the path to the audio
        breakpoints = request.json["breakpoints"]
        path_to_audio = request.json['path_to_audio']

        #load in the audio
        audio = AudioSegment.from_file(path_to_audio)
        predicted_labels = []
        for i in range(len(breakpoints)-1): # for each syllable
            start_time = breakpoints[i]*1000

            # for some reason if there's just one syllable, it sends over the last syllable end time as null, so this if is accounting for that
            if breakpoints[i+1]:
                end_time = breakpoints[i+1]*1000
                cut_audio = audio[start_time:end_time]
            else:
                cut_audio = audio[start_time:] 

            # save the syllable
            syllable_path = f"./public/syllables/chunk{i}.wav"
            with open(syllable_path, "w") as f:
                f.write("")
            cut_audio.export(syllable_path, format="wav")

            if production:  # make an api request call
                new_pred = query(syllable_path)
                if new_pred is None: # the api gave an error 
                    print(new_pred)
                    return jsonify({"result": new_pred}), 200
            else: # call the model directly
                new_pred = evaluate_model(syllable_path)
            predicted_labels.append(new_pred)
        
        tones = request.json["tones"]
        return_list = []
        for pred, tone in zip(predicted_labels, tones):
            correctness = int(pred) == int(tone)
            return_list.append({"prediction": int(pred), "correctness": correctness, "expected": int(tone)})
        return jsonify({"result": return_list}), 200

def parse(string):
    """
    basicall .strip(" ")
    """
    res = []
    for char in string:
        if char != ' ':
            res.append(char)
    return res
            

_unicode_chr_splitter = _Re( '(?s)((?:[\ud800-\udbff][\udc00-\udfff])|.)' ).split

def split_unicode_chrs( text ):
  """
  splits a unicode string into separate unicode characters
  """
  return [ chr for chr in _unicode_chr_splitter( text ) if chr]

def extract_tones(text):
    """
    gets a list of the tones from a given chinese string
    """
    result = pinyin_jyutping_sentence.pinyin(text, tone_numbers=True)
    # returns a string of pinyin for the sentence; we only care about the numbers, which are the tones
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
        if request.json["tones"]: # if we're given manually inputted tones, use those 
            tones = parse(request.json["tones"])
        else: #otherwise call our tone guesser given text (the pinyin_jyutping_sentence)
            tones = extract_tones(request.json["text"])
        
        # make the text into an array
        text = split_unicode_chrs(request.json["text"])
        
        response = jsonify({
             "text": text,
             "tones": tones
        })
        return response
        

# health check code for Render

@app.route("/healthz", methods=["GET"])
def health_check():
    print("health checks")
    return jsonify({"response": "OK"}), 200


def query(filename):
    """
    makes an api call to the huggingface model with audio input at filename
    """
    with open(filename, "rb") as f:
        data = f.read()
    response = requests.post(API_URL, data=data).json()
    if not isinstance(response, list): # this is an error message
        return response
    
    # get the label of the tone with the highest score (probability)
    best_label = 0
    best_score = 0
    for elem in response:
        if elem["score"] > best_score:
            best_label = elem["label"]
            best_score = elem["score"]
    return best_label 

def evaluate_model(path_to_audio):

    model = app.config['model'] # get the model
    feature_extractor = app.config['feature_extractor'] 
    wav_chunk, rate = librosa.load(path_to_audio, sr=16000) # load the audio 
    input_values = feature_extractor(wav_chunk, sampling_rate=rate, return_tensors = "pt").input_values # get the formatted input values
    os.environ["TORCH_USE_NNPACK"] = "0" # because we get a NN_PACK not usable warning
    logits = model(input_values).logits # call the models
    del os.environ["TORCH_USE_NNPACK"]
    
    return torch.argmax(logits, dim=-1).item() # get the most likely output 



if __name__ == "__main__":
    # port 10000 and 0.0.0.0 are default for Render
    port = int(os.environ.get("PORT", 10000))
    app.run(debug=True, host='0.0.0.0', port=port)  
    
