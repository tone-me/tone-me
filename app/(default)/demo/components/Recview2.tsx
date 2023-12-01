import React from "react";
import ReactDOM from "react-dom/client";
import { AudioRecorder } from "react-audio-voice-recorder";

const addAudioElement = (blob: any) => {
  const url = URL.createObjectURL(blob);
  const audio = document.createElement("audio");
  audio.src = url;
  audio.controls = true;
  document.body.appendChild(audio);
};
