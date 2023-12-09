"""
code for creating the json format for the datasets given a list of audio files of each syllable
"""

import random
from multiprocessing import Pool, freeze_support
import os
import librosa
import ujson


dataset_type = "test"
proportion = 0.25
def process_file(audio_file):

	if not os.path.exists(audio_file):
		return None
	y, sr = librosa.load(audio_file)
	y = y.tolist()
	return {
	"audio": {"path": "", "array": y, "sampling_rate": sr},
	"label": audio_file[-5],
	"file": audio_file}

def create_whisper_json(path_to_files):
	audio_files = []
	with open(path_to_files, "r") as f:
		for line in f: 
			if line[-1] == '\n':
				line = line[32:-1]
			else:
				line = line[32:]
			audio_files.append(line)
	audio_files = random.sample(audio_files, int(proportion * len(audio_files)))

	output_path = f"{dataset_type}_syllables_v2_{proportion}.json"
	if os.path.exists(output_path):
		os.remove(output_path)
	with open(output_path, "a") as f:
		f.write("[\n")
	pool = Pool(processes=6)
	results_generator = pool.imap_unordered(process_file, audio_files)
	pool.close()
	pool.join()
	
	counter = 0
	with open(output_path, "a") as f:
		for elem in results_generator:
			if elem is not None:
				if counter > 0:
					f.write(",\n")  # Add a comma and newline after the first element
				counter += 1
				json_object = ujson.dumps(elem, indent=4)
				f.write(json_object)
		f.write("\n]")
	

if __name__ == '__main__':
	freeze_support()
	# create_whisper_json("test_files.txt", "train")
	create_whisper_json(f"{dataset_type}_syllables_v2_files.txt")
	# create_whisper_json("temp_files_3.txt")