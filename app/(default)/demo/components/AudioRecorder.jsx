import { useState, useRef } from "react";
import "tailwindcss/tailwind.css";
import { useEffect } from "react";

const fetchData = async (audioBlob, setAudioPath) => {
    try {
        const formData = new FormData();
        formData.append("audio", audioBlob, "audio.wav");
        const response = await fetch("http://127.0.0.1:5000/fetch_audio", {
        method: "POST",
        mode: "cors",
        body: formData,
      });
  
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
  
      const data = await response.json();
      setAudioPath(data.path)
    } catch (error) {
      console.error("Failed to process text:", error);
    }
  };

const fetchPreds = async (boundaries, setPredictionOutput) => {
    
    try {
        const response = await fetch("http://127.0.0.1:5000/predict_audio", {
          method: "POST",
          mode: "cors",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ breakpoints: boundaries }),
        });
        const data = await response.json();
        let preds = data.result;
        setPredictionOutput(preds);
        console.log(preds);

    } catch (error) {
        console.error("Failed to predict audio:", error);
    }
}

const AudioRecorder = ({predictionOutput, setPredictionOutput, boundaries, setBoundaries,  audioPath, setAudioPath}) => {
    const mimeType = "audio/wav";
    const [permission, setPermission] = useState(false);
    const mediaRecorder = useRef(null);
    const [recordingStatus, setRecordingStatus] = useState("inactive");
    const [stream, setStream] = useState(null);
    const [audioChunks, setAudioChunks] = useState([]);
    const [audio, setAudio] = useState(null);
    const audioRef = useRef(null);
    const [speed, setSpeed] = useState(1.0);
    const [markSyllables, setMarkSyllables] = useState(false);

    useEffect(() => {
        // Set the default playback rate to 0.5x when the component mounts
        if (audioRef.current) {
          audioRef.current.playbackRate = 0.5;
        }
      }, []);

      useEffect( () => {
        setBoundaries([])
      }
        ,[audio]
      )
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

    const captureTime = () => {
        if (markSyllables)
        {
            let curTime = audioRef.current.currentTime
            setBoundaries(boundaries.concat([curTime]))
        }
    }

    const deleteTime = () => {
        if (boundaries.length >= 1)
        {
            setBoundaries(boundaries.slice(0, boundaries.length-1))
        }
    }
    const handleSpeedChange = (newSpeed) => {
        setSpeed(newSpeed);
        audioRef.current.playbackRate = newSpeed;
      };
    const startRecording = async () => {
        setRecordingStatus("recording");
        //create new Media recorder instance using the stream
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const source = audioContext.createMediaStreamSource(stream);

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
            fetchData(audioBlob, setAudioPath)
           const audioUrl = URL.createObjectURL(audioBlob);
           setAudio(audioUrl);
           setAudioChunks([]);
        };
    };
    useEffect( () => {
        getMicrophonePermission()
    }, []
    )
    return (
        <div>
            <main>
            <div className="audio-controls">
                {!permission ? (<>
                    <button onClick={getMicrophonePermission} type="button">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="#FFD4D4" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#D70040" className="w-24 h-24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                        </svg>
                    </button>
                    <p>Get Microphone</p>
                    </>
                ) : null}
                {permission && recordingStatus === "inactive" ? (<>
                <button onClick={startRecording} type="button" className="mt-10 m-auto flex items-center justify-center bg-blue-400 hover:bg-blue-500 rounded-full w-20 h-20 focus:outline-none">
                    <svg
                    viewBox="0 0 256 256"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-12 h-12 text-white"
                >
                    <path
                    fill="currentColor" // Change fill color to the desired color
                    d="M128 176a48.05 48.05 0 0 0 48-48V64a48 48 0 0 0-96 0v64a48.05 48.05 0 0 0 48 48ZM96 64a32 32 0 0 1 64 0v64a32 32 0 0 1-64 0Zm40 143.6V232a8 8 0 0 1-16 0v-24.4A80.11 80.11 0 0 1 48 128a8 8 0 0 1 16 0a64 64 0 0 0 128 0a8 8 0 0 1 16 0a80.11 80.11 0 0 1-72 79.6Z"
                    />
                    </svg>
                </button>
                <p>Start Recording </p>
                </>
                ) : null}
                {recordingStatus === "recording" ? (<>
                <button onClick={stopRecording} type="button" className="mt-10 m-auto flex items-center justify-center bg-red-400 hover:bg-red-500 rounded-full w-20 h-20 focus:outline-none"
                >   
                    <svg
                    className="h-12 w-12 "
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path fill="white" d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                    </svg>
                </button>
                <p> Stop Recording </p>
                </>
                ) : null}
            </div>
            {audio ? (
                <>
                <div className = "flex items-center justify-center">
                    <div className="audio-container">
                        <audio ref={audioRef} src={audio} playbackRate="0.5" controls></audio>
                        

                        <div className="class= bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                            <a download href={audio} className="download-link">
                            Download Recording
                            </a>
                        </div>

                        <label>
                        Speed:
                        <select
                            value={speed}
                            onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
                        >
                            <option value={0.25}>0.25x</option>
                            <option value={0.5}>0.5x</option>
                            <option value={1.0}>1.0x</option>
                            <option value={1.5}>1.5x</option>
                        </select>
                        </label>
                    </div>
                </div>
                <div>
                    {boundaries.map( (elem) =><p>{elem}</p> )}
                </div>
            
                <div class="inline-flex rounded-md shadow-sm" role="group">
                <button onClick={ () => setMarkSyllables(true)} type="button" className="px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-s-lg hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-blue-500 dark:focus:text-white">
                    Start
                </button>
                <button onClick={captureTime} type="button" className="px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-s-lg hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-blue-500 dark:focus:text-white">
                    Mark syllable
                </button>
                <button onClick={deleteTime} type="button" className="px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-s-lg hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-blue-500 dark:focus:text-white">
                    Delete last
                </button>
                <button onClick={ () => {setMarkSyllables(false); setBoundaries(boundaries.concat([audioRef.current.duration])); fetchPreds(boundaries.concat([audioRef.current.duration]), setPredictionOutput)}} type="button" className="px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-e-lg hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-blue-500 dark:focus:text-white">
                    Stop
                </button>
                </div>
                
            </>
            ) : null}
            </main>
        </div>
    );
};
export default AudioRecorder;