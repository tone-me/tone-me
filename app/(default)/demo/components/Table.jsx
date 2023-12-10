import React from "react";
import "./table.css"
import "app/globals.css";
import { useState, useRef } from 'react';
/* eslint-disable react/no-unescaped-entities */

const readText = (text) => {
  //uses the TTS
  const speech = new SpeechSynthesisUtterance();
  speech.text = text;
  speech.lang = "zh-CN";
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(speech);
};

const Table = ({ tonestring, predictionOutput, inputText, audio, boundaries }) => {

  /*
  our strategy for playing back the audio for each syllable is to have one audio element that's a copy of the original audio element
  and then every time we press one of the Listen buttons, we play that audio segment but starting at the timestamp of the syllable and pausing
  on the timestamp of the end of the syllable
  */

  const audioRef = useRef(null); // the reference to that invisible audio element

  /* our data for the table will be in the form of a list 
   [{"word": the chinese word we're considering, 
  "pronunciation": {"prediction": ?, "correctness": ?, "expected": ?},
  "id": the index number of the word
  }]

  */
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
            {data.map( (row_dict, i) => { return ( // we're going to have one row per entry in our data (i.e. per word)
              <tr key={row_dict['id']}> 
                <td>
                  {
                  row_dict["word"]  //the first cell is the chinese word itself
                  } 
                </td>
                <td>
                  { //this cell contains our expected tone, as well as the actual tone, marked green if it's correct and red if it's not 
                    <> 
                      <p>Expected Tone: {row_dict["pronunciation"]["expected"]}</p> 
                      {row_dict["pronunciation"]["correctness"] ? 
                      (<p style={{ color: '#00D100' }}>Actual Tone:  {row_dict["pronunciation"]["prediction"]} </p>) : 
                      (<p style={{ color: '#ff0000' }}>Actual Tone: {row_dict["pronunciation"]["prediction"]}</p>) }
                      </>
                    }
                </td>
                <td>
                  { // this cell contains a button that when pressed, calls the text to speech to read the word
                    <>
                    <button className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded" onClick={() => readText(row_dict['word'])}>Listen 🔊</button>
                    </>
                  }
                </td>
                <td>
                  { // this cell contains a button that when pressed, plays the parts of the audio that correspond to that syllable
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