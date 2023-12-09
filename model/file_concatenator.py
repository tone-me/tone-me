import shutil
 
# need to make sure to add a newline to the end
def merge_files_with_shutil(files, merged_file):
    with open(merged_file, 'wb') as outfile:
        for filename in files:
            with open(filename, 'rb') as infile:
                shutil.copyfileobj(infile, outfile)

merge_files_with_shutil(["daria_test_new_syllable_paths.txt", "test_new_syllable_paths.txt"], "test_syllables_v2.txt")