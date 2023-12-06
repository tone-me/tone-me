import { useState, useRef } from "react";
import "tailwindcss/tailwind.css";
import { useEffect } from "react";

const fetchData = async (audioBlob, setAudioPath) => {
  try {
    const formData = new FormData();
    formData.append("audio", audioBlob, "audio.wav");
    let production = true;
    const api_key = process.env.APIKEY
    let url = "https://tone-me-4.onrender.com/fetch_audio";
    const response = await fetch(url, {
      method: "POST",
      mode: "cors",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const data = await response.json();
    setAudioPath(data.path);
  } catch (error) {
    console.error("Failed to process text:", error);
  }
};

const fetchPreds = async (boundaries, setPredictionOutput) => {
  try {
    let production = true;
    let url = "https://tone-me-4.onrender.com/predict_audio";
    const response = await fetch(url, {
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
};

const AudioRecorder = ({
  predictionOutput,
  setPredictionOutput,
  boundaries,
  setBoundaries,
  audioPath,
  setAudioPath,
}) => {
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
      audioRef.current.playbackrate = 0.5;
    }
  }, []);

  useEffect(() => {
    setBoundaries([]);
  }, [audio]);
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
    if (markSyllables) {
      let curTime = audioRef.current.currentTime;
      setBoundaries(boundaries.concat([curTime]));
    }
  };

  const deleteTime = () => {
    if (boundaries.length >= 1) {
      setBoundaries(boundaries.slice(0, boundaries.length - 1));
    }
  };
  const handleSpeedChange = (newSpeed) => {
    setSpeed(newSpeed);
    audioRef.current.playbackRate = newSpeed;
  };
  const startRecording = async () => {
    setRecordingStatus("recording");
    //create new Media recorder instance using the stream
    const audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();
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
      fetchData(audioBlob, setAudioPath);
      const audioUrl = URL.createObjectURL(audioBlob);
      setAudio(audioUrl);
      setAudioChunks([]);
    };
  };
  useEffect(() => {
    getMicrophonePermission();
  }, []);
  return (
    <section>
      <div>
        <div>
          {/* CTA box */}
          <form
            className="grid relative bg-gray-900 rounded pt-10 pb-2 px-8 md:pt-16 md:pt-10 md:px-12 shadow-2xl overflow-hidden"
            data-aos="zoom-y-out"
          >
            <div className="grid-col-8">
              <div className="items-center lg:items-left md:items-left lg:max-w-xl">
                <h3 className="h3 text-white mb-2">Input Audio</h3>
                <p className="text-gray-300 text-lg mb-6">
                  After recording your sentence, indicate the syllable breaks in
                  your audio.
                </p>
                <div className="audio-controls grid grid-cols-12">
                  <div className="lg:col-span-3 md:col-span-3 lg:items-left md:items-left col-span-12 items-center">
                    <div className="items-center justify-center">
                      {!permission ? (
                        <>
                          <button
                            onClick={getMicrophonePermission}
                            type="button"
                          >
                            <img width="75px" src="get microphone.png"></img>
                          </button>
                          <p className="text-gray-300">Get Microphone</p>
                        </>
                      ) : null}
                      {permission && recordingStatus === "inactive" ? (
                        <>
                          <button
                            onClick={startRecording}
                            type="button"
                          >
                            <img width="75px" src="start recording.png"></img>
                          </button>
                          <p className="text-gray-300">Start Recording</p>
                        </>
                      ) : null}
                      {recordingStatus === "recording" ? (
                        <>
                          <button
                            onClick={stopRecording}
                            type="button"
                            className="ml-2 flex items-center justify-center bg-red-400 hover:bg-red-500 rounded-full w-20 h-20 focus:outline-none"
                          >
                            <svg
                              className="h-12 w-12 "
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                fill="white"
                                d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"
                              />
                            </svg>
                          </button>
                          <p className="text-gray-300">Stop Recording</p>
                        </>
                      ) : null}
                    </div>
                  </div>
                  <div className="col-span-8">
                    {audio ? (
                      <>
                        <div>
                          <div className="audio-container">
                            <audio
                              ref={audioRef}
                              src={audio}
                              playbackrate="0.5"
                              controls
                              className="w-full"
                            ></audio>
                            <div className="grid grid-cols-12 pt-2">
                              <div className="col-span-5 pt-2">
                                <label>
                                  <span className="text-gray-300">Speed</span>
                                  <select
                                    className="ml-2 rounded"
                                    value={speed}
                                    onChange={(e) =>
                                      handleSpeedChange(
                                        parseFloat(e.target.value)
                                      )
                                    }
                                  >
                                    <option value={0.25}>0.25x</option>
                                    <option value={0.5}>0.5x</option>
                                    <option value={1.0}>1.0x</option>
                                    <option value={1.5}>1.5x</option>
                                  </select>
                                </label>
                              </div>
                              <div className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-2 rounded col-span-7 text-center">
                                <a
                                  download
                                  href={audio}
                                  className="download-link"
                                >
                                  Download Audio
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div>
                          {boundaries.map((elem) => (
                            <p key={elem.id}>{elem}</p>
                          ))}
                        </div>

                        <div
                          className="inline-flex rounded-md shadow-sm pt-2 text-gray-300"
                          role="group"
                        >
                          <button
                            onClick={() => setMarkSyllables(true)}
                            type="button"
                            className="px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-s-lg hover:bg-gray-300 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-blue-500 dark:focus:text-white"
                          >
                            Start
                          </button>
                          <button
                            onClick={captureTime}
                            type="button"
                            className="px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 hover:bg-gray-300 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-blue-500 dark:focus:text-white"
                          >
                            Mark syllable
                          </button>
                          <button
                            onClick={deleteTime}
                            type="button"
                            className="px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 hover:bg-gray-300 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-blue-500 dark:focus:text-white"
                          >
                            Delete last
                          </button>
                          <button
                            onClick={() => {
                              setMarkSyllables(false);
                              setBoundaries(
                                boundaries.concat([audioRef.current.duration])
                              );
                              fetchPreds(
                                boundaries.concat([audioRef.current.duration]),
                                setPredictionOutput
                              );
                            }}
                            type="button"
                            className="px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-e-lg hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-blue-500 dark:focus:text-white"
                          >
                            Stop
                          </button>
                        </div>
                      </>
                    ) : null}
                  </div>
                </div>
              </div>
              <div className="pt-2"></div>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};
export default AudioRecorder;
