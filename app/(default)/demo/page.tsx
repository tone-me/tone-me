"use client";
import RecordingView from "./components/RecordingView";
import "app/globals.css";
import "/app/css/style.css";
import { useState, useRef } from "react";
import AudioRecorder from "./components/AudioRecorder";

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

const fetchData = async () => {
  try {
    const response = await fetch("http://127.0.0.1:5000/fetch_audio", {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: "Hello World" }),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error("Failed to process text:", error);
  }
};

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

  return (
    <main className="flex min-h-screen flex-col items-center bg-gray-10">
      <div style={{ color: "black" }}>
        <h1 style={titleStyle}>*✧･ﾟ:* Tone-Me ✧･ﾟ: *✧</h1>
        <p style={subtitleStyle}>
          Your Personal Chinese Mandarin Tone & Pronunciation Assistant
        </p>
        <AudioRecorder></AudioRecorder>
        {/* {!microphonePermission && (
          <button onClick={handleMicrophonePermission}>
            Grant Microphone Permission
          </button>
        )}
        {microphonePermission && (
          <AudioRecorder
            onRecordingComplete={(blob) => addAudioElement(blob)}
            audioTrackConstraints={{
              noiseSuppression: true,
              echoCancellation: true,
            }}
            downloadOnSavePress={true}
            downloadFileExtension="wav"
          />
        )} */}
      </div>
    </main>
  );
}
