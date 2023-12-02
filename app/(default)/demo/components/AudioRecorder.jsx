import { useState, useRef } from "react";

const fetchData = async (audioBlob, setPredictionOutput) => {
    try {
        const formData = new FormData();
        formData.append('audio', audioBlob, 'audio.wav');
        const response = await fetch("http://127.0.0.1:5000/fetch_audio", {
        method: "POST",
        mode: "cors",
        body: formData,
      });
  
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
  
      const data = await response.json();
      let preds = data['prediction']
      console.log(preds);
      setPredictionOutput(preds)
    
      
    } catch (error) {
      console.error("Failed to process text:", error);
    }
  };
const AudioRecorder = () => {
    const mimeType = "audio/wav";
    const [permission, setPermission] = useState(false);
    const mediaRecorder = useRef(null);
    const [recordingStatus, setRecordingStatus] = useState("inactive");
    const [stream, setStream] = useState(null);
    const [audioChunks, setAudioChunks] = useState([]);
    const [audio, setAudio] = useState(null);
    const [predictionOutput, setPredictionOutput] = useState(null);

    const getMicrophonePermission = async () => {
        if ("MediaRecorder" in window) {
            try {
                const streamData = await navigator.mediaDevices.getUserMedia({
                    audio: true,
                    video: false,
                });
                setPermission(true);
                setStream(streamData);
            } catch (err) {
                alert(err.message);
            }
        } else {
            alert("The MediaRecorder API is not supported in your browser.");
        }
    };

    const startRecording = async () => {
        setRecordingStatus("recording");
        //create new Media recorder instance using the stream
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const source = audioContext.createMediaStreamSource(stream);
        console.log('Sample Rate:', audioContext.sampleRate);
        console.log('Number of Channels:', source.channelCount);

        const media = new MediaRecorder(stream, { type: mimeType });
        //set the MediaRecorder instance to the mediaRecorder ref
        mediaRecorder.current = media;
        //invokes the start method to start the recording process
        mediaRecorder.current.start();
        let localAudioChunks = [];
        mediaRecorder.current.ondataavailable = (event) => {
           if (typeof event.data === "undefined") return;
           if (event.data.size === 0) return;
           localAudioChunks.push(event.data);
        };
        setAudioChunks(localAudioChunks);
    };

    const stopRecording = () => {
        setRecordingStatus("inactive");
        //stops the recording instance
        mediaRecorder.current.stop();
        mediaRecorder.current.onstop = () => {
          //creates a blob file from the audiochunks data
           const audioBlob = new Blob(audioChunks, { type: mimeType });
           
          //creates a playable URL from the blob file.
             // console.log(audioBlob);
            fetchData(audioBlob, setPredictionOutput)
           const audioUrl = URL.createObjectURL(audioBlob);
           setAudio(audioUrl);
           setAudioChunks([]);
        };
    };
    return (
        <div>
            <h2>Audio Recorder</h2>
            <main>
            <div className="audio-controls">
                {!permission ? (
                <button onClick={getMicrophonePermission} type="button">
                    Get Microphone
                </button>
                ) : null}
                {permission && recordingStatus === "inactive" ? (
                <button onClick={startRecording} type="button">
                    Start Recording
                </button>
                ) : null}
                {recordingStatus === "recording" ? (
                <button onClick={stopRecording} type="button">
                    Stop Recording
                </button>
                ) : null}
            </div>
            {audio ? (
                <>
            <div className="audio-container">
                <audio src={audio} controls></audio>
                <a download href={audio}>
                    Download Recording
                </a>
            </div>
            <div>
                <p>Prediction: {predictionOutput}</p>
            </div>
            </>
            ) : null}
            </main>
        </div>
    );
};
export default AudioRecorder;