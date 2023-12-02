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
            
            <section>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="pb-12 md:pb-20">

          {/* CTA box */}
          <div className="grid relative bg-gray-900 rounded py-10 px-8 md:py-16 md:px-12 shadow-2xl overflow-hidden" data-aos="zoom-y-out">
            <div className="grid-col-8">
              {/* CTA content */}
              <form onSubmit = {onSubmit}>

              <div className="text-center lg:text-left lg:max-w-xl">
                <h3 className="h3 text-white mb-2">Tone.me Demo</h3>
                <p className="text-gray-300 text-lg mb-6">Your personal chinese mandarin tone and pronunciation assistant. Input your text and tones here.</p>
                <div className="flex">
                {/* CTA form */}
                
                <div className="w-6/12">
                  <div className="flex flex-col sm:flex-row justify-center max-w-xs mx-auto sm:max-w-md lg:mx-0">
                    <input type="email" className="form-input w-full appearance-none bg-gray-800 border border-gray-700 focus:border-gray-600 rounded-sm px-4 py-3 mb-2 sm:mb-0 sm:mr-2 text-white placeholder-gray-500" placeholder="Text Input" aria-label="Your email…" />
                  </div>
                  {/* Success message */}
                  {/* <p className="text-sm text-gray-400 mt-3">Thanks for subscribing!</p> */}
                  
                </div>
                <div className="w-6/12">
                  <div className="flex flex-col sm:flex-row justify-center max-w-xs mx-auto sm:max-w-md lg:mx-0">
                    <input type="email" className="form-input w-full appearance-none bg-gray-800 border border-gray-700 focus:border-gray-600 rounded-sm px-4 py-3 mb-2 sm:mb-0 sm:mr-2 text-white placeholder-gray-500" placeholder="Tone Preferences" aria-label="Your email…" />                    
                  </div>
                </div>                
                </div>
                <div className="pt-2">
                  <a className="btn text-white bg-blue-600 hover:bg-blue-700 shadow" href="#0">Save</a>
                  <p className="text-sm text-gray-400 mt-3">Record your audio to the right then hit submit above.</p>
                </div>
              </div>
              </form>

            </div>
            
             {/* Background illustration */}
             <div className="absolute right-0 bottom-0 pointer-events-none hidden lg:block" aria-hidden="true">
              <svg width="200" height="328" xmlns="http://www.w3.org/2000/svg">
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


          </div>

        </div>
      </div>
    </section>
            {/* <div class="w-full max-w-xs">
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
            </div> */}
        </>
    );
};
export default SelectionBox;