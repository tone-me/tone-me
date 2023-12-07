"use client";
/* eslint-disable react/no-unescaped-entities */
import "app/globals.css";
import "/app/css/style.css";
import { useState, useEffect, useRef } from "react";
import AudioRecorder from "./components/AudioRecorder";
import SelectionBox from "./components/SelectionBox";
import Header from "./components/Header";
import Table from "./components/Table";
import Footer from "../../components/footer";

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
  const [audio, setAudio] = useState("");
  const audioRef = useRef(null);
  // const [pythonAudio, setPythonAudio] = useState<number[]>([]);

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
  // let audioURL = "";
  // console.log(pythonAudio);
  // if (pythonAudio) {
  //   const uint8Array = new Uint8Array(pythonAudio);
  //   let audioBlob = new Blob([uint8Array], { type: "audio/wav" });
  //   audioURL = URL.createObjectURL(audioBlob);
  // }
  function playAudioSegment(audioRef: any, startTime: number, endTime: number) {
    // Make sure the audioRef is defined
    console.log(audioRef);
    console.log(audioRef.current);
    if (audioRef.current) {
      // Set the start time
      console.log("are we even playing this");
      audioRef.current.currentTime = startTime;

      // Play the audio
      audioRef.current.play();

      // Stop the audio at the end time
      audioRef.current.addEventListener(
        "timeupdate",
        function handleTimeUpdate() {
          if (audioRef.current.currentTime >= endTime) {
            // Pause the audio when it reaches the end time
            audioRef.current.pause();
            // Remove the timeupdate event listener to avoid unnecessary calls
            audioRef.current.removeEventListener(
              "timeupdate",
              handleTimeUpdate
            );
          }
        }
      );
    }
  }

  // const itemsRef: any = useRef({});
  // const array = [
  //   [0, 0.5],
  //   [0.5, 1],
  // ];
  // useEffect(() => {
  //   console.log(itemsRef.current[0]);
  // }, itemsRef);
  return (
    <main>
      <div>
        <Header />
        <div className="pt-12 relative w-screen mx-auto px-4 sm:px-6 flex flex-row items-center justify-center">
          <div className="grid grid-cols-12 container">
            <div className="lg:col-span-6 col-span-12 pr-0 lg:pr-4">
              <SelectionBox
                setTonestring={setTonestring}
                setInputText={setInputText}
              ></SelectionBox>
            </div>
            <div
              className="lg:col-span-6 col-span-12 rounded bg-gray-900 mt-4 pb-12 lg:pb-0 lg:mt-0"
              data-aos="zoom-y-out"
            >
              <AudioRecorder
                predictionOutput={predictionOutput}
                setPredictionOutput={setPredictionOutput}
                boundaries={boundaries}
                setBoundaries={setBoundaries}
                audioPath={audioPath}
                setAudioPath={setAudioPath}
                inputText={inputText}
                tonestring={tonestring}
                audio={audio}
                setAudio={setAudio}
              ></AudioRecorder>
            </div>
          </div>
        </div>
        {/* {array.map((item, id) => {
          itemsRef.current[id] = useRef(null);
          return (
            <div key={id}>
              <audio src={audio} controls ref={itemsRef.current[id]}></audio>
              <button
                onClick={() =>
                  playAudioSegment(itemsRef.current[id], item[0], item[1])
                }
              >
                Play
              </button>
            </div>
          );
        })} */}

        {/* <audio ref={itemsRef[0]} src={audio} controls></audio>
        <button onClick={() => playAudioSegment(itemsRef[0], 0.5, 1)}>
          Play{" "}
        </button>
        <audio ref={itemsRef[1]} src={audio} controls></audio>
        <button onClick={() => playAudioSegment(itemsRef[1], 0, 0.5)}>
          Play{" "}
        </button> */}
        {arrayEquals(old_tones, tonestring) && (
          <div className="pt-8 container relative w-screen mx-auto flex flex-row items-center justify-center">
            <Table
              tonestring={tonestring}
              predictionOutput={predictionOutput}
              inputText={inputText}
              audio={audio}
              boundaries={boundaries}
            />
          </div>
        )}
        {tonestring}
        {inputText}
      </div>
      <div className="pt-12">
        <Footer />
      </div>
    </main>
  );
}
