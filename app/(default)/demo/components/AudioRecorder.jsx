import { useState, useRef } from "react";
import "tailwindcss/tailwind.css";
import { useEffect } from "react";

const fetchData = async (audioBlob, setAudioPath) => {
  try {
    const formData = new FormData();
    formData.append("audio", audioBlob, "audio.wav");
    let production = true;
    let url = production ? "https://tone-me-4.onrender.com/fetch_audio" : "http://0.0.0.0:10000/fetch_audio";
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

const fetchPreds = async (boundaries, setPredictionOutput, inputText, tonestring, audioPath) => {
  try {
    let production = true;
    let url = production ? "https://tone-me-4.onrender.com/predict_audio" : "http://0.0.0.0:10000/predict_audio";
    const response = await fetch(url, {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ breakpoints: boundaries, text: inputText, tones: tonestring, path_to_audio: audioPath}),
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
  inputText,
  tonestring
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
            className="grid relative bg-gray-900 rounded pt-10 pb-2 px-10 md:pt-16 shadow-2xl overflow-hidden"
            data-aos="zoom-y-out"
          >
            <div className="grid-col-8">
              <div className="lg:items-left md:items-left items-center lg:max-w-xl">
                <h3 className="h3 text-white lg:text-left md:text-left mb-2">Input Audio</h3>
                <p className="text-gray-300 text-lg lg:text-left md:text-left mb-6">
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
                            <img width="75px" src="2176428.png"></img>
                          </button>
                          <p className="text-gray-300">Start Recording</p>
                        </>
                      ) : null}
                      {recordingStatus === "recording" ? (
                        <>
                          <button
                            onClick={stopRecording}
                            type="button"
                          >
                            <img width="75px" src="stop recording.png"></img>
                          </button>
                          <p className="text-gray-300">Stop Recording</p>
                        </>
                      ) : null}
                    </div>
                  </div>
                  <div className="lg:col-span-1 md:col-span-1"></div>
                  <div className="lg:col-span-8 md:col-span-8 col-span-12 lg:pt-0 md:pt-0 pt-10 pb-10">
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
                            <div className="pt-2">
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
                          </div>
                        </div>
                        <div>
                          {boundaries.map((elem) => (
                            <p className="text-white" key={elem.id}>{elem}</p>
                          ))}
                        </div>

                        <div
                          className="inline-flex rounded-md shadow-sm pt-2 text-gray-300 w-full"
                          role="group"
                        >
                          <button
                            onClick={() => setMarkSyllables(true)}
                            type="button"
                            className="w-1/6 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-s-lg hover:bg-gray-300 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-blue-500 dark:focus:text-white"
                          >
                            Start
                          </button>
                          <button
                            onClick={captureTime}
                            type="button"
                            className="w-2/6 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 hover:bg-gray-300 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-blue-500 dark:focus:text-white"
                          >
                            Mark syllable
                          </button>
                          <button
                            onClick={deleteTime}
                            type="button"
                            className="w-2/6 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 hover:bg-gray-300 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-blue-500 dark:focus:text-white"
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
                                setPredictionOutput,
                                inputText,
                                tonestring,
                                audioPath
                              );
                            }}
                            type="button"
                            className="w-1/6 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-e-lg hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-blue-500 dark:focus:text-white"
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
