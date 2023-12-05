"use client";
/* eslint-disable react/no-unescaped-entities */
import "app/globals.css";
import "/app/css/style.css";
import { useState, useRef } from "react";
import AudioRecorder from "./components/AudioRecorder";
import SelectionBox from "./components/SelectionBox";
import Header from "./components/Header";
import Table from "./components/Table";

// dependencies: {
//   "@testing-library/jest-dom": "^5.17.0",
//   "@testing-library/react": "^13.4.0",
//   "@testing-library/user-event": "^13.5.0",
//   "react": "^18.2.0",
//   "react-dom": "^18.2.0",
//   "react-icons": "^4.11.0",
//   "react-router-dom": "^6.16.0",
//   "react-scripts": "5.0.1",
//   "styled-components": "^5.3.10",
//   "web-vitals": "^2.1.4"
// }
const titleStyle = {
  marginTop: "30px",
  marginBottom: "15px",
  fontSize: "60px",
  color: "#bc6c25",
  fontFamily: "Trebuchet MS",
};

const subtitleStyle = {
  marginTop: "12px",
  fontSize: "30px",
  fontFamily: "Trebuchet MS",
  color: "#d4a373",
};

interface Output {
  prediction: number;
  expected: number;
  correctness: Boolean;
}

function arrayEquals(a: string[], b: string[]) {
  let ans =
    Array.isArray(a) &&
    Array.isArray(b) &&
    a.length === b.length &&
    a.every((val, index) => val === b[index]);
  return ans;
}

export default function Home() {
  // const [microphonePermission, setMicrophonePermission] = useState(false);

  // const handleMicrophonePermission = async () => {
  //   try {
  //     const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  //     // If the promise resolves, the user granted permission
  //     setMicrophonePermission(true);
  //     stream.getTracks().forEach((track) => track.stop()); // Stop the stream
  //   } catch (error) {
  //     console.error("Error accessing microphone:", error);
  //     setMicrophonePermission(false);
  //   }
  // };

  // const addAudioElement = (blob: any) => {
  //   console.log("complete");
  //   const url = URL.createObjectURL(blob);
  //   const audio = document.createElement("audio");
  //   audio.src = url;
  //   audio.controls = true;
  //   document.body.appendChild(audio);
  // };
  // fetchData();

  const [tonestring, setTonestring] = useState<string[]>([]);
  const [inputText, setInputText] = useState<string[]>([]);
  const [predictionOutput, setPredictionOutput] = useState<Output[]>([]);
  const [boundaries, setBoundaries] = useState<number[]>([]);
  const [audioPath, setAudioPath] = useState<string>("");

  // const [tonestring, setTonestring] = useState(["1", "2"]);
  // const [inputText, setInputText] = useState(["中", "国"]);
  // const [predictionOutput, setPredictionOutput] = useState([
  //   {
  //     prediction: 1,
  //     correctness: 1,
  //     expected: 1,
  //   },
  //   {
  //     prediction: 2,
  //     correctness: 1,
  //     expected: 2,
  //   },
  // ]);
  let old_tones: string[] = [];
  if (predictionOutput && predictionOutput.length) {
    old_tones = predictionOutput.map((elem) => elem["expected"].toString());
  }

  // console.log("rerendering");
  // console.log(
  //   inputText.map((word, index) => {
  //     return {
  //       word: word,
  //       pronunciation: predictionOutput[index],
  //     };
  //   })
  // );
  return (
    <main>
      <div>
        <Header />
        <h1 className="prose transform -translate-y-1/2 text-xl mx-2">
          Version 4. For the below text, first, submit the Chinese sentence or
          phrase you want to say on the left. Then record yourself saying that
          using the microphone on the right. <br></br>
          <br></br>Afterwards, you have to manually indicate where the syllable
          breaks in your audio are. Press the white Start button that will show
          up. Play the audio (you can adjust playback speed), and every time you
          get to a break between two syllables, press mark syllable. Once you're
          done, press Stop.
        </h1>
        <div className="relative w-screen mx-auto px-4 sm:px-6 transform -translate-y-1/8 flex flex-row items-center justify-center">
          <div className="grid grid-cols-12 pb-12 md:pb-20 container">
            <div className="lg:col-span-7 col-span-12">
              <SelectionBox
                tonestring={tonestring}
                setTonestring={setTonestring}
                setInputText={setInputText}
              ></SelectionBox>
            </div>
            <div className="lg:col-span-5 col-span-12 rounded bg-gray-900">
              <AudioRecorder
                predictionOutput={predictionOutput}
                setPredictionOutput={setPredictionOutput}
                boundaries={boundaries}
                setBoundaries={setBoundaries}
                audioPath={audioPath}
                setAudioPath={setAudioPath}
              ></AudioRecorder>
            </div>
          </div>
        </div>
        {arrayEquals(old_tones, tonestring) && (
          <div className="w-screen flex items-center justify-center">
            <Table
              tonestring={tonestring}
              predictionOutput={predictionOutput}
              inputText={inputText}
            />
          </div>
        )}
        {tonestring}
        {inputText}
      </div>
    </main>
  );
}
