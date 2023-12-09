if __name__ == '__main__':
	in_file = "train_syllables_v2_totalfiles.txt"
	# in_file = "test_files.txt"
	audio_files = []
	with open(in_file, "r") as f:
		for line in f:
			audio_files.append(line)

	train_val = round(0.9 * len(audio_files))
	with open("train_syllables_v2_files.txt", "a") as f:
		for line in audio_files[:train_val]:
			f.write(line)
	with open("validation_syllables_v2_files.txt", "a") as f:
		for line in audio_files[train_val:]:
			f.write(line)
