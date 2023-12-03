import { useState, useRef } from "react";
/* eslint-disable react/no-unescaped-entities */
const SelectionBox = ( {tonestring, setTonestring, setInputText} ) => {
    const onSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        setTonestring(formData.get("tone-input"));
        try {
            const response = await fetch("http://127.0.0.1:5000/fetch_text", {
              method: "POST",
              mode: "cors",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ tones: formData.get("tone-input"), text: formData.get("text-input") }),
            });
            const data = await response.json() 
            // console.log(data.text)
            setInputText(data.text)
          } catch (error) {
            console.error("Failed to process text:", error);
          }
    }
    
    return ( <>
            <div className="w-full max-w-xs">
            <form className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4" onSubmit = {onSubmit}>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="text-input">
                        Sentence you want recorded
                    </label>
                    <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" name="text-input" id="text-input" type="text-input" placeholder="中国"/>
                </div>
                    <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="tone-input">
                        Input the tones for your sentence
                    </label>
                    <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline" name = "tone-input" id="tone-input" type="tone-input" placeholder="1 2"/>
                </div>
                <div className="flex items-center justify-between">
                <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="submit">
                    Save
                </button>
                </div>
            </form>
            </div>
        </>
    );
};
export default SelectionBox;