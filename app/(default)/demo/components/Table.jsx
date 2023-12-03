import React from "react";
import "./table.css"
import "app/globals.css";
/* eslint-disable react/no-unescaped-entities */

const Table = ({ tonestring, predictionOutput, inputText }) => {
  let data = inputText.map((word, index) => {
        return {
          word: word,
          pronunciation: predictionOutput[index],
          id: index
        };
      });
  console.log(data)
  return (
    <>
        <table>
          <thead>
            <tr>
              <th> Word </th>
              <th> Pronunciation </th>
              <th> Correct Pronunciation </th>
              </tr>
          </thead>
          <tbody>
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
                    Riddhi's stuff
                </td>
              </tr>
            )})}
          </tbody>
        </table>
    </>
  )
};

export default Table;