# import torch
# import datasets
# from datasets import load_dataset
# from datasets import load_metric
# from datasets import Features, Audio, ClassLabel, Value
# from transformers import AutoFeatureExtractor, AutoModelForAudioClassification, TrainingArguments, Trainer
# import numpy as np
# from huggingface_hub import login
# import evaluate




# def compute_metrics(eval_pred):
#     """Computes accuracy on a batch of predictions"""
#     predictions = np.argmax(eval_pred.predictions, axis=1)
#     return metric.compute(predictions=predictions, references=eval_pred.label_ids)

# if __name__ == '__main__':
# 	model_checkpoint = "facebook/wav2vec2-base"
# 	batch_size = 32
# 	device = "mps" if torch.backends.mps.is_available() else "cpu"
# 	data_files = {"train": "train_syllables_testing.json",
# 	              "validation": "validation_syllables_testing.json",
# 	              "test": "test_syllables_testing.json"}
# 	try:
# 	    dataset = load_dataset("json", data_files=data_files)
# 	except datasets.builder.DatasetGenerationError as e:
# 	    print(f"Dataset generation error: {e}")
# 	    # Add additional information, if available, about the problematic file or error.
# 	# dataset = load_dataset("json", data_files = data_files)


# 	features = Features({
# 	    "audio": Audio(sampling_rate = 16000),
# 	    "label": ClassLabel(num_classes=6, names=["0", "1", "2", "3", "4", "5"]),
# 	    "file": Value(dtype="string")})
# 	for t in data_files:
# 	    dataset[t] = dataset[t].cast(features)

# 	metric = load_metric("accuracy")
# 	labels = dataset["train"].features["label"].names
# 	label2id, id2label = dict(), dict()
# 	for i, label in enumerate(labels):
# 	    label2id[label] = str(i)
# 	    id2label[str(i)] = label


# 	feature_extractor = AutoFeatureExtractor.from_pretrained(model_checkpoint)
# 	max_duration = 0.4  # seconds
# 	def preprocess_function(examples):
# 	    audio_arrays = [x["array"] for x in examples["audio"]]
# 	    inputs = feature_extractor(
# 	        audio_arrays,
# 	        sampling_rate=feature_extractor.sampling_rate,
# 	        max_length=int(feature_extractor.sampling_rate * max_duration),
# 	        truncation=True,
# 	    )
# 	    return inputs
# 	encoded_dataset = dataset.map(preprocess_function, remove_columns=["audio", "file"], batched=True)


# 	num_labels = len(id2label)
# 	model = AutoModelForAudioClassification.from_pretrained(
# 	    model_checkpoint,
# 	    num_labels=num_labels,
# 	    label2id=label2id,
# 	    id2label=id2label,
# 	)


# 	model_name = model_checkpoint.split("/")[-1]

# 	args = TrainingArguments(
# 	    f"{model_name}-version2",
# 	    evaluation_strategy = "epoch",
# 	    save_strategy = "epoch",
# 	    learning_rate=3e-5,
# 	    per_device_train_batch_size=batch_size,
# 	    gradient_accumulation_steps=4,
# 	    per_device_eval_batch_size=batch_size,
# 	    num_train_epochs=5,
# 	    warmup_ratio=0.1,
# 	    logging_steps=10,
# 	    load_best_model_at_end=True,
# 	    metric_for_best_model="accuracy",
# 	)

# 	trainer = Trainer(
#     model,
#     args,
#     train_dataset=encoded_dataset["train"],
#     eval_dataset=encoded_dataset["validation"],
#     tokenizer=feature_extractor,
#     compute_metrics=compute_metrics,
# 	)

# 	trainer.train()

# 	trainer.evaluate()

# 	# trainer.push_to_hub()



