"""
This was the code originally written on Google Colab that we used to split the audio into syllables

pip install librosa pydub 
pip install -U git+https://github.com/jianfch/stable-ts.git

"""
import os
from pathlib import Path
import librosa
import numpy as np
import json
from pydub import AudioSegment
from pydub.silence import split_on_silence
from google.colab import drive
import inspect
import sys
import stable_whisper
import pprint
import pandas as pd
from ast import literal_eval
import re


import string
import torch
import numpy as np
from typing import TYPE_CHECKING, List, Callable, Optional
from itertools import chain
from whisper.audio import TOKENS_PER_SECOND, N_SAMPLES_PER_TOKEN
from whisper.timing import WordTiming, median_filter, dtw, merge_punctuations

if TYPE_CHECKING:
    from whisper.tokenizer import Tokenizer
    from whisper.model import Whisper


import warnings
import importlib.metadata

import whisper.tokenizer


# copy pasted some dependencies, IGNORE THIS BLOCK


system_encoding = sys.getdefaultencoding()

if system_encoding != "utf-8":

    def make_safe(string):
        # replaces any character not representable using the system default encoding with an '?',
        # avoiding UnicodeEncodeError (https://github.com/openai/whisper/discussions/729).
        return string.encode(system_encoding, errors="replace").decode(system_encoding)

else:

    def make_safe(string):
        # utf-8 can encode any Unicode code point, so no need to do the round-trip encoding
        return string


def str_to_valid_type(val: str):
    if len(val) == 0:
        return None
    if '/' in val:
        return [a.split('*') if '*' in a else a for a in val.split('/')]
    try:
        val = float(val) if '.' in val else int(val)
    except ValueError:
        pass
    finally:
        return val


def get_func_parameters(func):
    return inspect.signature(func).parameters.keys()


def isolate_useful_options(options: dict, method, pop: bool = False) -> dict:
    _get = dict.pop if pop else dict.get
    return {k: _get(options, k) for k in get_func_parameters(method) if k in options}


def safe_print(msg: str):
    if msg:
        print(make_safe(msg))


def format_timestamp(
    seconds: float, always_include_hours: bool = False, decimal_marker: str = "."
):
    assert seconds >= 0, "non-negative timestamp expected"
    milliseconds = round(seconds * 1000.0)

    hours = milliseconds // 3_600_000
    milliseconds -= hours * 3_600_000

    minutes = milliseconds // 60_000
    milliseconds -= minutes * 60_000

    seconds = milliseconds // 1_000
    milliseconds -= seconds * 1_000

    hours_marker = f"{hours:02d}:" if always_include_hours or hours > 0 else ""
    return (
        f"{hours_marker}{minutes:02d}:{seconds:02d}{decimal_marker}{milliseconds:03d}"
    )


class UnsortedException(Exception):

    def __init__(self, message: str = None, data: dict = None):
        if not message:
            message = 'Timestamps are not in ascending order. If data is produced by Stable-ts, please submit an issue.'
        super().__init__(message)
        self.data = data

    def get_data(self):
        return self.data


# copy pasted some dependencies, IGNORE THIS BLOCK



_COMPATIBLE_WHISPER_VERSIONS = (
    '20230314',
    '20230918',
    '20231105',
    '20231106'
)
_required_whisper_ver = _COMPATIBLE_WHISPER_VERSIONS[-1]

_TOKENIZER_PARAMS = get_func_parameters(whisper.tokenizer.get_tokenizer)


def warn_compatibility_issues(
        whisper_module,
        ignore: bool = False,
        additional_msg: str = ''
):
    compatibility_warning = ''
    if not ignore:
        if whisper_module.__version__ not in _COMPATIBLE_WHISPER_VERSIONS:
            compatibility_warning += (f'Whisper {whisper_module.__version__} is installed.'
                                      f'Versions confirm to be compatible: {", ".join(_COMPATIBLE_WHISPER_VERSIONS)}\n')
        _is_whisper_repo_version = bool(importlib.metadata.distribution('openai-whisper').read_text('direct_url.json'))
        if _is_whisper_repo_version:
            compatibility_warning += ('The detected version appears to be installed from the repository '
                                      'which can have compatibility issues '
                                      'due to multiple commits sharing the same version number. '
                                      f'It is recommended to install version {_required_whisper_ver} from PyPI.\n')

        if compatibility_warning:
            compatibility_warning = (
                    'The installed version of Whisper might be incompatible.\n'
                    + compatibility_warning +
                    'To prevent errors and performance issues, reinstall correct version with: '
                    f'"pip install --upgrade --no-deps --force-reinstall openai-whisper=={_required_whisper_ver}".'
            )
            if additional_msg:
                compatibility_warning += f' {additional_msg}'
            warnings.warn(compatibility_warning)


def get_tokenizer(model=None, **kwargs):
    """
    Backward compatible wrapper of :func:`whisper.tokenizer.get_tokenizer`.
    """
    if model is not None and 'multilingual' not in kwargs:
        kwargs['multilingual'] = model.is_multilingual
    if 'num_languages' in _TOKENIZER_PARAMS:
        if hasattr(model, 'num_languages'):
            kwargs['num_languages'] = model.num_languages
    elif 'num_languages' in kwargs:
        del kwargs['num_languages']
    return whisper.tokenizer.get_tokenizer(**kwargs)



# copy pasted some dependencies, IGNORE THIS BLOCK




# modified version of whisper.timing.find_alignment
def find_alignment_stable(
        model: "Whisper",
        tokenizer: "Tokenizer",
        text_tokens: List[int],
        mel: torch.Tensor,
        num_samples: int,
        *,
        medfilt_width: int = 7,
        qk_scale: float = 1.0,
        ts_num: int = 0,
        ts_noise: float = 0.1,
        token_split=None,
        audio_features: torch.Tensor = None
) -> List[WordTiming]:
    tokens = torch.tensor(
        [
            *tokenizer.sot_sequence,
            tokenizer.no_timestamps,
            *text_tokens,
            tokenizer.eot,
        ]
    ).to(model.device)

    # install hooks on the cross attention layers to retrieve the attention weights
    QKs = [None] * model.dims.n_text_layer
    hooks = [
        block.cross_attn.register_forward_hook(
            lambda _, ins, outs, index=i: QKs.__setitem__(index, outs[-1])
        )
        for i, block in enumerate(model.decoder.blocks)
    ]

    with torch.no_grad():
        if audio_features is None:
            audio_features = model.encoder(mel.unsqueeze(0))
        if ts_num:
            if ts_noise is None:
                ts_noise = 0.1
            extra_audio_features = audio_features.repeat_interleave(ts_num, 0)
            torch.manual_seed(0)
            audio_features = torch.cat([audio_features,
                                        extra_audio_features *
                                        (1 - (torch.rand_like(extra_audio_features) * ts_noise))],
                                       dim=0)
            logits = model.decoder(tokens.unsqueeze(0).repeat_interleave(audio_features.shape[0], 0),
                                   audio_features)
        else:
            logits = model.decoder(tokens.unsqueeze(0), audio_features)

        logits = logits[0]
        sampled_logits = logits[len(tokenizer.sot_sequence):, : tokenizer.eot]
        token_probs = sampled_logits.softmax(dim=-1)
        text_token_probs = token_probs[np.arange(len(text_tokens)), text_tokens]
        text_token_probs = text_token_probs.tolist()

    for hook in hooks:
        hook.remove()

    # heads * tokens * frames
    weights = torch.cat([QKs[_l][:, _h] for _l, _h in model.alignment_heads.indices().T], dim=0)
    weights = weights[:, :, : round(num_samples / N_SAMPLES_PER_TOKEN)]
    weights = (weights * qk_scale).softmax(dim=-1)
    std, mean = torch.std_mean(weights, dim=-2, keepdim=True, unbiased=False)
    weights = (weights - mean) / std
    weights = median_filter(weights, medfilt_width)

    matrix = weights.mean(axis=0)
    matrix = matrix[len(tokenizer.sot_sequence): -1]
    text_indices, time_indices = dtw(-matrix)

    if token_split is None:
        words, word_tokens = tokenizer.split_to_word_tokens(text_tokens + [tokenizer.eot])
    else:
        words, word_tokens = token_split
        words.append(tokenizer.decode([tokenizer.eot]))
        word_tokens.append([tokenizer.eot])
    word_boundaries = np.pad(np.cumsum([len(t) for t in word_tokens[:-1]]), (1, 0))

    jumps = np.pad(np.diff(text_indices), (1, 0), constant_values=1).astype(bool)
    jump_times = time_indices[jumps].clip(min=0) / TOKENS_PER_SECOND
    start_times = jump_times[word_boundaries[:-1]]
    end_times = jump_times[word_boundaries[1:]]
    word_probabilities = [
        np.mean(text_token_probs[i:j])
        for i, j in zip(word_boundaries[:-1], word_boundaries[1:])
    ]

    return [
        WordTiming(word, tokens, start, end, probability)
        for word, tokens, start, end, probability in zip(
            words, word_tokens, start_times, end_times, word_probabilities
        )
    ]


def _split_tokens(tokens: List[int], tokenizer: "Tokenizer"):
    split_by_space = tokenizer.language not in {"zh", "ja", "th", "lo", "my"}
    text = tokenizer.decode_with_timestamps(tokens)
    words = []
    word_tokens = []
    curr_tokens = []
    is_append = False
    for token in tokens:
        curr_tokens.append(token)
        curr_text = tokenizer.decode(curr_tokens)
        is_whole = token >= tokenizer.eot
        if not is_whole:
            is_whole = text[:len(curr_text)] == curr_text
            if is_whole and split_by_space:
                is_append = not (curr_text.startswith(" ") or curr_text.strip() in string.punctuation)

        if is_whole:
            if is_append and len(words) != 0:
                words[-1] += curr_text
                word_tokens[-1].extend(curr_tokens)
            else:
                words.append(curr_text)
                word_tokens.append(curr_tokens)
            text = text[len(curr_text):]
            curr_tokens = []

    if len(curr_tokens) != 0:
        words.append(curr_text if len(text) == 0 else text)
        word_tokens.append(curr_tokens)
    elif len(text) != 0:
        words[-1] += text

    return words, word_tokens


def split_word_tokens(segments: List[dict],
                      tokenizer: "Tokenizer",
                      *,
                      padding: (str, int) = None,
                      split_callback: Callable = None):
    if padding is not None:
        if isinstance(padding, str):
            padding = tokenizer.encode(padding)
        else:
            padding = [padding]
    tokens = []
    seg_indices = []
    words = []
    word_tokens = []
    for i, s in enumerate(segments):
        temp_word_tokens = [t for t in s['tokens'] if not isinstance(t, int) or t < tokenizer.eot]
        curr_words, curr_word_tokens = (
            _split_tokens(temp_word_tokens, tokenizer)
            if split_callback is None else
            split_callback(temp_word_tokens, tokenizer)
        )
        assert len(curr_words) == len(curr_word_tokens), \
            f'word count and token group count do not match, {len(curr_words)} and {len(curr_word_tokens)}'
        if (
                padding is not None and
                curr_word_tokens[0][0] != padding and
                (len(tokens) == 0 or tokens[-1] != padding)
        ):
            tokens.extend(padding)
            words.append(None)
            word_tokens.append(padding)
        seg_indices.extend([i] * len(curr_words))
        tokens.extend(list(chain.from_iterable(curr_word_tokens)))
        words.extend(curr_words)
        word_tokens.extend(curr_word_tokens)

    return tokens, (words, word_tokens), seg_indices


def pop_empty_alignment(alignment: List[WordTiming]):
    return list(reversed([alignment.pop(i) for i in reversed(range(len(alignment))) if alignment[i].word is None]))


# modified version of whisper.timing.add_word_timestamps
def add_word_timestamps_stable(
        *,
        segments: List[dict],
        model: "Whisper",
        tokenizer: "Tokenizer",
        mel: torch.Tensor,
        num_samples: int,
        prepend_punctuations: str = "\"'“¿([{-",
        append_punctuations: str = "\"'.。,，!！?？:：”)]}、",
        audio_features: torch.Tensor = None,
        ts_num: int = 0,
        ts_noise: float = 0.1,
        min_word_dur: float = 0.1,
        split_callback: Callable = None,
        gap_padding: Optional[str] = ' ...',
        **kwargs,
):
    if len(segments) == 0:
        return

    if min_word_dur is None:
        min_word_dur = 0

    if prepend_punctuations is None:
        prepend_punctuations = "\"'“¿([{-"

    if append_punctuations is None:
        append_punctuations = "\"'.。,，!！?？:：”)]}、"

    def align():
        for seg in segments:
            seg['words'] = []

        text_tokens, token_split, seg_indices = split_word_tokens(segments, tokenizer,
                                                                  padding=gap_padding, split_callback=split_callback)

        alignment = find_alignment_stable(model, tokenizer, text_tokens, mel, num_samples,
                                          **kwargs,
                                          token_split=token_split,
                                          audio_features=audio_features,
                                          ts_num=ts_num,
                                          ts_noise=ts_noise)
        alt_beginning_alignment = pop_empty_alignment(alignment)

        merge_punctuations(alignment, prepend_punctuations, append_punctuations)

        time_offset = segments[0]["seek"]

        assert len(alignment) == len(seg_indices)
        assert (gap_padding is None or len(segments) == len(alt_beginning_alignment))
        for i, timing in zip(seg_indices, alignment):
            if len(timing.tokens) != 0:
                start = timing.start
                end = timing.end
                if (
                        len(segments[i]['words']) == 0 and
                        ((end - start) < min_word_dur) and
                        len(alt_beginning_alignment)
                ):
                    start = alt_beginning_alignment[i].start
                segments[i]['words'].append(
                    dict(
                        word=timing.word,
                        start=round(time_offset + start, 3),
                        end=round(time_offset + end, 3),
                        probability=timing.probability,
                        tokens=timing.tokens
                    )
                )

    align()
    if (
            gap_padding is not None and
            any(
                (word['end'] - word['start']) < min_word_dur
                for seg in segments
                for word in seg['words']
            )
    ):
        gap_padding = None
        align()

    for segment in segments:
        if len(words := segment["words"]) > 0:
            # adjust the segment-level timestamps based on the word-level timestamps
            segment["start"] = words[0]["start"]
            segment["end"] = words[-1]["end"]

# =========================================================
# our code starts here 
# 


min_silence_len = 50
silence_thresh = -30

def cut_audio(input_file, output_file, start_time, end_time, filter=True):
    """
    Cut parts of an audio file and save it to a new file. If filter is true, only do this if the resulting audio passes the filter

    Args:
        input_file (str): Path to the input audio file.
        output_file (str): Path to save the output audio file.
        start_time (int): Start time in milliseconds.
        end_time (int): End time in milliseconds.
    """
    # Load the audio file
    audio = AudioSegment.from_file(input_file)

    # Cut the audio
    cut_audio = audio[start_time:end_time]
    chunks = [1]
    if filter:
      chunks = split_on_silence(cut_audio, min_silence_len=min_silence_len, silence_thresh=silence_thresh)

    if len(chunks) == 1:
    # Save the cut audio to a new file
      cut_audio.export(output_file, format="wav")

def whisper_stable_ts_timestamps(audio_path, text, debugging=False):
	"""
	takes in the audio path to a file, the text transcription (str)
	returns a list of intervals for the syllables

	audio_path: (str), directory to audio file
	text: (list) list of integers, which are generated by calling get_tokens on the plain text
	debugging: (bool) if True, prints out the time intervals and what words they correspond to
	"""
	name = "whisper_stable_ts"
	# calling the model to align the audio to the text
	result = model.align(audio_path, text, language="zh", verbose = None, max_word_dur = 1.0, min_word_dur = 0.05, fast_mode=True, only_voice_freq = True)
	result = result.to_dict()
	result = result ["segments"][0]["words"] # just getting the intervals part of the result
	if debugging:
	pprint.pprint(result)

	# make a list of (start time, end time) for each interval
	ans = [(word["start"], word["end"]) for word in result]
	return ans

def get_tokens(text, text_spaces, debugging=False):
  """
  takes in a text unicode sentence without spaces (actually one space at the very beginning), outputs a list of ints (the tokens)

  attempts to fix the issue of compound words by manually separating them when tokenizing
  """
  # generate the list of words = textarray
  textarray = text_spaces.split(" ")
  textarray.insert(0, " ")

  # apply the clean tokenize function to both the no space text and the list of words
  tokens_without_spaces = tokenize(text)
  token_list = [tokenize(word)[0] for word in textarray]

  # the two should look like
  # [[220], [32141], [32316], [2415, 96], [34688], [14003], [4275], [20559, 98], [12467], [17238, 238], [8990], [20545], [11103]]
  # [[220], [32141], [32316], [2415, 96], [34688], [14003], [4275], [20559, 98], [12467], [17238, 238], [2257], [3338], [20545], [11103]]
  # where the difference is due to the no space version considering two words as just one token, [8990], while
  # the list of tokenized individual words contains [2257], [3338] for that position, meaning it considered the words separately
  if debugging:
    print(f"{tokens_without_spaces=}")
    print(f"{token_list=}")

  # we will create a corrections dictionary that maps (8990,) to ([[2257], [3338]], 1) for instance
  # where the 1 tells us that there's only 1 element in to-be-replaced segment of the no_spaces version
  corrections = {}

  # firstptr goes along the tokens_without_spaces list, i goes along token_list
  firstptr = 0
  i = 0

  while i < len(token_list) and firstptr < len(tokens_without_spaces):
    if debugging:
      print(f"{i=}, {firstptr=}")
      print(corrections)
    # if they match, move on to the next tokens
    if token_list[i] == tokens_without_spaces[firstptr]:
      firstptr+=1
      i += 1
      continue
    #otherwise they don't match
    #let's try to figure out what the token in tokens_without_spaces got replaced with
    tuple_ver = tuple(tokens_without_spaces[firstptr])
    replacement = []

    # # if we're on the last word, take the rest of the tokens in token_list as the replacement
    orig_firstptr = firstptr
    # if firstptr == len(tokens_without_spaces)-1:
    #   while i < len(token_list):
    #     replacement.extend(token_list[i])
    #     i += 1
    # else:
      # take the tokens until we match the token from the next word in tokens_without_spaces
    rest_of_list = token_list[i+1:]
    while firstptr+1 < len(tokens_without_spaces) and tokens_without_spaces[firstptr+1] not in rest_of_list:
      firstptr += 1
    if firstptr + 1 == len(tokens_without_spaces):
      nextval = 0
    else:
      nextval = tokens_without_spaces[firstptr+1]
    while i < len(token_list) and token_list[i] != nextval:
      replacement.extend(token_list[i])
      i += 1
    corrections[tuple(tokens_without_spaces[orig_firstptr])] = (replacement, firstptr-orig_firstptr+1)
    firstptr += 1
  if debugging:
    print(f"{corrections=}")

  # now we need to use these corrections to figure out the actual input to the aligning model
  # the input to the aligning model is of the same format as tokenizer.encode(text)
  # however, this has some extra tokens compared to the cleaned version we got from tokenize
  # thus, we'll start with tokenizer.encode(text) and then every time we see a token in corrections, we'll replace it with its replacement
  starting = tokenizer.encode(text)
  if debugging:
    print(f"{starting=}")
  ending = []
  i = 0
  while i < len(starting):
    val = starting[i]
    if (val,) in corrections:
      ending.extend(corrections[(val,)][0])
      i += corrections[(val,)][1]
    else:
      ending.append(val)
      i += 1
  if debugging:
    print(f"{ending=}")
  return ending

def debug_syllable(index, dataset_type):
  """
  debugging the syllable splitting for the sample in row index of the train csv data

  outputs the timestamps and words, as well as
  the different token versions (cleaned and directly encoded for both no space and array version) for the audio

  saves the split syllable files to the debugging folder in AIM labs folder (make sure to delete later)
  """
  csv = train_csv if dataset_type=="train" else test_csv
  row = csv.iloc[index] # gets the row in the csv
  file_name = row["file name"]
  speaker = file_name[:-8] # gets the speaker from the file name
  audio_path = f"/content/drive/MyDrive/AIM_Labs/data_aishell3/{dataset_type}/{dataset_type}_wav/{speaker}/{file_name}"
  text_no_spaces = " " + row["unicode_no_space"]
  text_spaces = row["unicode"]
  # get the text input from get_tokens
  text = get_tokens(text_no_spaces, text_spaces, debugging=True)
  # get the timestamps
  timestamps = timestamp_func(audio_path=audio_path, text=text_no_spaces, debugging=True)

  # save the clipped audio files for each time interval
  for i, interval in enumerate(timestamps):
      cur_pinyin = row["pinyin"][i][0]
      cur_label = row["pinyin"][i][1]
      output_path = f"/content/drive/MyDrive/AIM_Labs/Debugging Syllables/{i}#{cur_pinyin}!{cur_label}.wav"
      # I found that adding a fixed 0.1 seconds to the start time of the interval and 0.08 seconds to the end time helps dramatically
      cut_audio(input_file=audio_path, output_file=output_path, start_time=(interval[0]+0.1)*1000, end_time=(interval[1]+0.08)*1000)


def generate_syllables(timestamp_func, dataset_type, model_name):
  """
  starts generating syllable split folders for each train/test sentence

  basically does the same thing as debug_syllables
  """
  csv = train_csv if dataset_type == "train" else test_csv
  for index, row in csv.iterrows():
    file_name = row["file name"]
    speaker = file_name[:-8]
    audio_path = f"/content/drive/MyDrive/AIM_Labs/data_aishell3/{dataset_type}/{dataset_type}_wav/{speaker}/{file_name}"
    text_no_spaces = " " + row["unicode_no_space"]
    text_spaces = row["unicode"]
    # means that the original chinese contained a word + er compound
    if text_spaces == "BAD":
      print(f"known bad: {index}")
      continue
    model_folder = f"/content/drive/MyDrive/AIM_Labs/data_aishell3/{dataset_type}/{dataset_type}_wav/{speaker}/{model_name}/"
    if not os.path.exists(model_folder):
      os.makedirs(model_folder)
    syllable_folder = f"{model_folder}{file_name}/good_syllables/"
    if os.path.exists(syllable_folder):
      continue
    else:
      os.makedirs(syllable_folder)

    try:
      text = get_tokens(text_no_spaces, text_spaces)
    except:
      print(index, "couldn't get tokens")
      continue

    try:
      timestamps = timestamp_func(audio_path=audio_path, text=text)
    except:
      print(index, "couldn't calculate timestamps")
      continue


    # this means that the aligner failed to align correctly, so we skip over the sample
    if len(timestamps) != len(row["pinyin"]):
      print(index, "didn't correctly align")
      continue

    timestamps[0] = (timestamps[0][0]-0.1, timestamps[0][1])

    for i, interval in enumerate(timestamps):
      cur_pinyin = row["pinyin"][i][0]
      cur_label = row["pinyin"][i][1]
      output_path = f"{syllable_folder}{i}#{cur_pinyin}!{cur_label}.wav"
      cut_audio(input_file=audio_path, output_file=output_path, start_time=(interval[0]+0.1)*1000, end_time=(interval[1]+0.08)*1000)
      f.write(f"{output_path}\n")
      f.flush()



if __name__ == "__main__":
	drive.mount('/content/drive', force_remount = True)
	model = stable_whisper.load_model('base')
	# sets the device to gpu
	device = "cuda" if torch.cuda.is_available() else "cpu"
	print(device)
	model = model.to(device)
	# loading in the train csv
	timestamp_func = whisper_stable_ts_timestamps

	# literal_eval makes it read in the csv as actual unicoded strings and lists, instead of as plaintext
	train_csv = pd.read_csv("/content/drive/MyDrive/AIM_Labs/data_aishell3/train/train_transformed_content_unicode.csv",
	                        converters={"pinyin": literal_eval, "unicode": literal_eval, "unicode_no_space": literal_eval})
	train_csv.head(10)
	test_csv = pd.read_csv("/content/drive/MyDrive/AIM_Labs/data_aishell3/test/test_transformed_content_unicode.csv",
	                        converters={"pinyin": literal_eval, "unicode": literal_eval, "unicode_no_space": literal_eval})
	test_csv.head(10)
	tokenizer = get_tokenizer(model, language="zh", task='transcribe')
	# tokenizer takes in the input text and turns it into numbers basically

	def tokenize(text):
	  """
	  stolen from the stable-ts github: applies the tokenizer to text and then cleans it up
	  """
	  tokens = tokenizer.encode(text) if isinstance(text, str) else text
	  tokens = [t for t in tokens if t < tokenizer.eot]
	  _, (words, word_tokens), _ = split_word_tokens([dict(tokens=tokens)], tokenizer)
	  return word_tokens
	# test of get_tokens
	assert(get_tokens(" \u9ed1\u5ba2\u5ba3\u5e03\u53ea\u8981\u64a5\u6253\u67d0\u4e00\u500b\u96fb\u8a71", "\u9ed1 \u5ba2 \u5ba3 \u5e03 \u53ea \u8981 \u64a5 \u6253 \u67d0 \u4e00 \u500b \u96fb \u8a71") == [220, 32141, 32316, 2415, 96, 34688, 14003, 4275, 20559, 98, 12467, 17238, 238, 2257, 3338, 20545, 11103]
	)

	paths_to_new_syllable = "/content/drive/MyDrive/AIM_Labs/test_new_syllable_paths.txt"
	f = open(paths_to_new_syllable, "a")
	generate_syllables(whisper_stable_ts_timestamps, dataset_type="test", model_name="whisper-stable-ts")





