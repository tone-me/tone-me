from transformers import AutoModelForAudioClassification, AutoFeatureExtractor
import librosa
import torch

def evaluate_model(path, model, feature_extractor):
    audio, rate = librosa.load(path, sr=16000)
    input_values = feature_extractor(audio, sampling_rate=rate, return_tensors = "pt").input_values
    logits = model(input_values).logits
    predicted_label = torch.argmax(logits, dim=-1).item()
    return predicted_label

if __name__ == "__main__":
    model_name = "cge7/wav2vec2-base-version3"
    model = AutoModelForAudioClassification.from_pretrained(model_name)
    feature_extractor = AutoFeatureExtractor.from_pretrained(model_name)
    path_to_audio = "/Users/chrisge/Downloads/data_aishell3/train/train_wav/SSB0193/whisper-stable-ts/SSB01930147.wav/good_syllables/8#xiao!4.wav"
    print(evaluate_model(path=path_to_audio, model=model, feature_extractor=feature_extractor))
    app.run(debug=True)