import React from "react";
import "./table.css"
import "app/globals.css";
import { useState, useRef } from 'react';
/* eslint-disable react/no-unescaped-entities */

const readText = (text, setTextToRead) => {
  setTextToRead(text);
  const speech = new SpeechSynthesisUtterance();
  speech.text = text;
  speech.lang = "zh-CN";
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(speech);
  setTextToRead(" ")
};

const Table = ({ tonestring, predictionOutput, inputText, audio, boundaries }) => {
  const [textToRead, setTextToRead] = useState('');
  //surely nobody is using more than 25 words in their phrase
  const audioRef = useRef(null); 
  let data = inputText.map((word, index) => {
        return {
          word: word,
          pronunciation: predictionOutput[index],
          id: index
        };
      });
  
  function playAudioSegment(audioRef, startTime, endTime) {
    // Make sure the audioRef is defined
    if (audioRef.current) {
      // Set the start time
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
  return (
    <>
        <table>
          <thead>
            <tr>
              <th style={{ borderTopLeftRadius: '10px' }}> Word </th>
              <th> Pronunciation </th>
              <th> Correct Pronunciation </th>
              <th style={{ borderTopRightRadius: '10px' }}>Your Pronunciation </th>
              </tr>
          </thead>
          <tbody style={{ borderRadius: '10px' }}>
            {data.map( (row_dict, i) => { return (
              <tr key={row_dict['id']}> 
                <td>
                  {row_dict["word"]}
                </td>
                <td>
                  {<> 
                      <p>Expected Tone: {row_dict["pronunciation"]["expected"]}</p> 
                      {row_dict["pronunciation"]["correctness"] ? 
                      (<p style={{ color: '#00D100' }}>Actual Tone:  {row_dict["pronunciation"]["prediction"]} </p>) : 
                      (<p style={{ color: '#ff0000' }}>Actual Tone: {row_dict["pronunciation"]["prediction"]}</p>) }
                      </>}
                </td>
                <td>
                  {row_dict['word'] === textToRead ? (
                    <p>Speaking 🗣️</p>
                  ) : (
                    <button className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded" onClick={() => readText(row_dict['word'], setTextToRead)}>Listen 🔊</button>
                  )}
                </td>
                <td>
                  {
                    <>
                      <button className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded" onClick={() => playAudioSegment(audioRef, boundaries[i], boundaries[i+1])} > Listen 🔊 </button>
                    </>
                  }
                </td>
              </tr>
            )})}
          </tbody>
        </table>
        <audio ref = {audioRef} src={audio} controls className = "visibility: hidden"> </audio> 
    </>
  )
};

export default Table;