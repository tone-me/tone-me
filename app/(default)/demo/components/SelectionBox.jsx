import { useState, useRef } from "react";
/* eslint-disable react/no-unescaped-entities */
const SelectionBox = ( {tonestring, setTonestring, setInputText} ) => {
    const onSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        setTonestring(formData.get("tone-input"));
        let production = true;
        let url = production ? 
        "http://tone-me.onrender.com/fetch_text": 
        "http://127.0.0.1:10000/fetch_text";
        try {
            const response = await fetch(url, {
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
            setTonestring(data.tones)
          } catch (error) {
            console.error("Failed to process text:", error);
          }
    }
    
    return ( <>
        <section>
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
                <div>

                {/* CTA box */}
                <form className="grid relative bg-gray-900 rounded py-10 px-8 md:py-16 md:px-12 shadow-2xl overflow-hidden" data-aos="zoom-y-out" onSubmit = {onSubmit}>
                    <div className="grid-col-8">
                    {/* CTA content */}
                    <div className="text-center lg:text-left lg:max-w-xl">
                        <h3 className="h3 text-white mb-2">Input Preferences</h3>
                        <p className="text-gray-300 text-lg mb-6">Insert the sentence (in Chinese) which you will say, and if you would like, for higher accuracy, input preferred tone preferences.</p>
                        <div className="grid lg:grid-cols-2 grid-cols-1">
                        {/* CTA form */}
                        <div className="">
                            <div className="px-1 py-1">
                                <label className="text-white block" htmlFor="text-input">
                                    Sentence<span className="text-red-500">*</span>
                                </label>
                                <input className="form-input block w-full appearance-none bg-gray-800 border border-gray-700 focus:border-gray-600 rounded-sm px-4 py-3 mb-2 sm:mb-0 sm:mr-2 text-white placeholder-gray-500" name="text-input" id="text-input" type="text-input" placeholder="中国" required />
                            </div>
                        </div>
                        <div className="">
                            <div className="px-2 py-1">
                                <label className="text-white block">Tones</label>
                                <input className="form-input block w-full appearance-none bg-gray-800 border border-gray-700 focus:border-gray-600 rounded-sm px-4 py-3 mb-2 sm:mb-0 sm:mr-2 text-white placeholder-gray-500" name="tone-input" id="tone-input" type="tone-input" placeholder="1 4 2..." />                    
                            </div>                       
                        </div>
                        </div>
                        <div className="pt-2">
                        <button className="btn text-white bg-blue-600 hover:bg-blue-700 shadow" type="submit">Save</button>
                        <p className="text-sm text-gray-400 mt-3">After saving these preferences, record audio to the right.</p>
                        </div>
                    </div>
                    </div>
                    
                    {/* bg illustration from internet*/}
                    <div className="absolute right-0 bottom-0 pointer-events-none hidden lg:block" aria-hidden="true">
                    <svg width="170" height="300" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                        <radialGradient cx="35.542%" cy="34.553%" fx="35.542%" fy="34.553%" r="96.031%" id="ni-a">
                            <stop stopColor="#DFDFDF" offset="0%" />
                            <stop stopColor="#4C4C4C" offset="44.317%" />
                            <stop stopColor="#333" offset="100%" />
                        </radialGradient>
                        </defs>
                        <g fill="none" fillRule="evenodd">
                        <g fill="#FFF">
                            <ellipse fillOpacity=".04" cx="185" cy="15.576" rx="16" ry="15.576" />
                            <ellipse fillOpacity=".24" cx="100" cy="68.402" rx="24" ry="23.364" />
                            <ellipse fillOpacity=".12" cx="29" cy="251.231" rx="29" ry="28.231" />
                            <ellipse fillOpacity=".64" cx="29" cy="251.231" rx="8" ry="7.788" />
                            <ellipse fillOpacity=".12" cx="342" cy="31.303" rx="8" ry="7.788" />
                            <ellipse fillOpacity=".48" cx="62" cy="126.811" rx="2" ry="1.947" />
                            <ellipse fillOpacity=".12" cx="78" cy="7.072" rx="2" ry="1.947" />
                            <ellipse fillOpacity=".64" cx="185" cy="15.576" rx="6" ry="5.841" />
                        </g>
                        <circle fill="url(#ni-a)" cx="276" cy="237" r="200" />
                        </g>
                    </svg>
                    </div>


                </form>

                </div>
            </div>
        </section>  
            {/* <div className="w-full max-w-xs">
            <form className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4" onSubmit = {onSubmit}>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="text-input">
                        Sentence you want recorded
                    </label>
                    <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" name="text-input" id="text-input" type="text-input" placeholder="中国"/>
                </div>
                    <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="tone-input">
                        Input the tones for your sentence for higher accuracy (optional)
                    </label>
                    <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline" name = "tone-input" id="tone-input" type="tone-input" placeholder="1 2"/>
                </div>
                <div className="flex items-center justify-between">
                <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="submit">
                    Save
                </button>
                </div>
            </form>
            </div> */}
        </>
    );
};
export default SelectionBox;