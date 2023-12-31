import { useState, useRef } from "react";
import "tailwindcss/tailwind.css";
import { useEffect } from "react";

/* eslint-disable react/no-unescaped-entities */


const fetchData = async (audioBlob, setAudioPath) => {
  // sends the audio over to app.py, where it uploads the audio for future use in
  // predicting the tones once we know where the syllables are 
  
  try {
    // store the audio as a file in form data
    const formData = new FormData();
    formData.append("audio", audioBlob, "audio.wav");
    let production = false; //whether we're trying to host locally or on Render
    //the fetch_audio refers to the function that it calls in app.py 
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
    // the response is in the form of a json {"path": file_name of where the audio is stored}
    setAudioPath(data.path);
  } catch (error) {
    console.error("Failed to process text:", error);
  }
};

const fetchPreds = async (boundaries, setPredictionOutput, inputText, tonestring, audioPath) => {

  // send the syllable boundaries over to app.py, wait for it to calculate the predicted tones, and then store them 
  // passing in inputText, tonestring, and audioPath here because we're unable to store values on the Flask server between calls
  try {
    let production = false;
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
    // the response is in the form json { "result": [list of prediction objects for each word = {"prediction": ?, "correctness": ?, "expected": ?}}]}
    let preds = data.result;
    setPredictionOutput(preds); // store the prediction output in the react hook, which will then be used to update the Table.jsx
  } catch (error) {
    console.error("Failed to predict audio:", error);
  }
};

const AudioRecorder = ({
  setPredictionOutput,
  boundaries,
  setBoundaries,
  audioPath,
  setAudioPath,
  inputText,
  tonestring,
  audio,
  setAudio
}) => {
  const mimeType = "audio/wav"; //the media type for our audioBlob
  const [permission, setPermission] = useState(false); // whether or not we have microphone permission
  const mediaRecorder = useRef(null); //reference to the MediaRecorder object that records the audio
  const [recordingStatus, setRecordingStatus] = useState("inactive"); // recording or inactive, decides what icon we display for the microphone
  const [stream, setStream] = useState(null); // used with the MediaRecorder 
  const [audioChunks, setAudioChunks] = useState([]); // also used with the MediaRecorder
  const audioRef = useRef(null); // reference to the html audio element that plays back what was recorded
  const [speed, setSpeed] = useState(1.0); // playbackspeed of the audio element 
  const [markSyllables, setMarkSyllables] = useState(false); // whether we've started marking syllables (i.e. has the user pressed start)

  // reset the syllable boundaries every time we record a new audio
  useEffect(() => {
    setBoundaries([0]);
  }, [audio]);


  const getMicrophonePermission = async () => {
    if ("MediaRecorder" in window) {
      try {
        // this is the funtion that actually asks for audio permission
        const streamData = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: false,
        });
        setPermission(true);

        //use that audio stream for the recording
        setStream(streamData);
      } catch (err) {
        alert(err.message);
      }
    } else {
      alert("The MediaRecorder API is not supported in your browser.");
    }
  };

  const captureTime = () => {
    // append the current audio time to the syllables list
    if (markSyllables) {
      let curTime = audioRef.current.currentTime;
      setBoundaries(boundaries.concat([curTime]));
    }
  };

  const deleteTime = () => {
    // delete the last syllable time that we have marked 
    if (boundaries.length >= 1) {
      setBoundaries(boundaries.slice(0, boundaries.length - 1));
    }
  };
  const handleSpeedChange = (newSpeed) => {
    // change the playbackrate
    setSpeed(newSpeed);
    audioRef.current.playbackRate = newSpeed;
  };

  const handleStopSyllables = () => {
    // stop marking the syllables
    setMarkSyllables(false);
    setBoundaries(
      boundaries.concat([audioRef.current.duration]) // add the end of the audio clip as the end of the last syllable
    );

    //get the predictions now that we have the syllables
    fetchPreds(
      boundaries.concat([audioRef.current.duration]), //we have to add it again here because the react hook doesn't update until recompilation
      setPredictionOutput,
      inputText,
      tonestring,
      audioPath
    );
  }
  const startRecording = async () => {
    setRecordingStatus("recording");
    //create new Media recorder instance using the stream
    const audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();
    
    const media = new MediaRecorder(stream, { type: mimeType });
    //set the MediaRecorder instance to the mediaRecorder ref
    mediaRecorder.current = media;
    //invokes the start method to start the recording process
    mediaRecorder.current.start();
    let localAudioChunks = [];

    //when there's a new recording chunk, add it to the chunks list
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

  //get microphone permission upon mounting the page
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
                      {!permission ? ( // only show the get permission microphone button if we don't have permission
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
                      {permission && recordingStatus === "inactive" ? ( // if we have permission but haven't started recording yet, show the start recording button
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
                      {recordingStatus === "recording" ? ( // if we're recording, show the recording button
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
                          <p className="text-white"> Here's where your syllable boundaries will show up (starting with 0 seconds)</p>
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
                            onClick={handleStopSyllables}
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
