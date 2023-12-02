import { useState, useRef } from "react";
/* eslint-disable react/no-unescaped-entities */
const SelectionBox = ( {tonestring, setTonestring, setInputText} ) => {
    const onSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        setInputText(formData.get("text-input"));
        setTonestring(formData.get("tone-input"));
        
    }

    return ( <>
            <div class="w-full max-w-xs">
            <form class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4" onSubmit = {onSubmit}>
                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2" htmlFor="text-input">
                        Sentence you want recorded
                    </label>
                    <input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" name="text-input" id="text-input" type="text-input" placeholder="text"/>
                </div>
                    <div class="mb-6">
                    <label class="block text-gray-700 text-sm font-bold mb-2" htmlFor="tone-input">
                        Input the tones for your sentence
                    </label>
                    <input class="shadow appearance-none border border-red-500 rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline" name = "tone-input" id="tone-input" type="tone-input" placeholder="2 3"/>
                </div>
                <div class="flex items-center justify-between">
                <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="submit">
                    Save
                </button>
                </div>
            </form>
            </div>
        </>
    );
};
export default SelectionBox;