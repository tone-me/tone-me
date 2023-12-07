import React from "react";
import "./table.css"
import "app/globals.css";
import { useState } from 'react';
/* eslint-disable react/no-unescaped-entities */

const readText = (text, setTextToRead) => {
  setTextToRead(text);
  const speech = new SpeechSynthesisUtterance();
  speech.text = text;
  speech.lang = "zh-CN";
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(speech);
};

const Table = ({ tonestring, predictionOutput, inputText }) => {
  const [textToRead, setTextToRead] = useState('');
  let data = inputText.map((word, index) => {
        return {
          word: word,
          pronunciation: predictionOutput[index],
          id: index
        };
      });
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
                    <button onClick={() => readText(row_dict['word'], setTextToRead)}>Listen 🔊</button>
                  )}
                </td>
                <td style={{ display: 'flex', justifyContent:'center', alignItems:'center'}}>
                  {
                      <audio src={"syllables/chunk" + row_dict['id'].toString() + ".wav"} type="audio/wav" controls></audio>
                  }
                </td>
              </tr>
            )})}
          </tbody>
        </table>
    </>
  )
};

export default Table;