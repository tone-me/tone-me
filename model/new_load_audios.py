"""
code for creating the json format for the datasets given a list of audio files of each syllable
"""

import random
from multiprocessing import Pool, freeze_support
import os
import librosa
import ujson


dataset_type = "test" # train, validation, or test, which dataset split are we generating
proportion = 0.25  #the proportion of the data that we want to keep 
def process_file(audio_file):
    """
	given a path to an audio file, return a dictionary with the audio values themselves (from Librosa), the tone label, and the file
	"""
    if not os.path.exists(audio_file):
        return None
    y, sr = librosa.load(audio_file)
    y = y.tolist()
    return {
    "audio": {"path": "", "array": y, "sampling_rate": sr},
    "label": audio_file[-5],
    "file": audio_file}

def create_whisper_json(path_to_files):
	"""
	writes out to the output file an array of dictionary objects, each of the form {"audio": ..., "label": ..., "file": ...}
	"""
	audio_files = []
	with open(path_to_files, "r") as f:
		for line in f:
			# get rid of the newline at the end if there is one, since we don't want that in the file path string
			if line[-1] == '\n':
				line = line[32:-1] 
			else:
				line = line[32:]
			audio_files.append(line)
	
    # pick a random sample of the audio files based on the proportion constant we set 
	audio_files = random.sample(audio_files, int(proportion * len(audio_files)))
	output_path = f"{dataset_type}_syllables_v2_{proportion}.json"
	if os.path.exists(output_path):
		os.remove(output_path)
		
    # we use append mode instead of write because writing the entire file at once overloads memory RAM 

	with open(output_path, "a") as f:
		f.write("[\n")
	#multiprocessing the files
	pool = Pool(processes=6)
	results_generator = pool.imap_unordered(process_file, audio_files) #creates a generator of the results so that we don't store them all at once (which overloads RAM)
	pool.close()
	pool.join()
	
	counter = 0
	with open(output_path, "a") as f:
		for elem in results_generator:
			if elem is not None:
				if counter > 0:
					f.write(",\n")  # Add a comma and newline after the first element
				counter += 1
				json_object = ujson.dumps(elem, indent=4) #create the json for this one data point, and then write it out to the file
				f.write(json_object)
        #write the ending bracket for the array of data
		f.write("\n]")
	

if __name__ == '__main__':
	freeze_support() # resetting the multiprocessing
	create_whisper_json(f"{dataset_type}_syllables_v2_files.txt")