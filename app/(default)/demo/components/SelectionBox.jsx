import { useState, useRef } from "react";

const SelectionBox = ( {tonestring, setTonestring} ) => {
    
    const handleChange = async (event) => {
        try {
            const response = await fetch("http://127.0.0.1:5000/fetch_text", {
              method: "POST",
              mode: "cors",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ text: event.target.value }),
            });
          } catch (error) {
            console.error("Failed to process text:", error);
          }
	    setTonestring(event.target.value);
    };

    return (
        <div>
            <h2>Specify Tones</h2>
            <main>
                <input style={{ border: "solid" }} type="tones" id="tones" name="tones" onChange={handleChange}/>
        <p>You"ve specified: {tonestring}</p>
            </main>
        </div>
    );
};
export default SelectionBox;