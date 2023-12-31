import React from "react";
import Link from "next/link";
/* eslint-disable react/no-unescaped-entities */

const Header = () => {
  return (
    <div className="">
      {/* Hero content */}
      <div className="pt-32 relative w-screen mx-auto flex flex-row items-center justify-center container">
        {/* Section header */}
        <div className="text-3xl mb-2 bg-gray-900 p-4 h3 text-white rounded-lg">
          Tone-Me{" "}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-teal-400">
            Demo
          </span>{" "}
        </div>
      </div>
      <div className="mx-4 sm:mx-0">
      <div
        data-aos="zoom-y-out"
        className="mt-10 relative w-screen mx-auto flex flex-row items-center justify-center container text-xl py-10 text-left bg-gray-200 backdrop-blur-lg rounded-xl m-0"
      >
        <ol className="px-10 list-decimal space-y-3 list-inside">
          <li>
            Submit the Mandarin Chinese sentence or phrase you want to say on
            the left below.
          </li>
          <ol style={{ listStyleType: "square", marginLeft: "2em" }}>
            <li>
              For higher accuracy, you may also submit the intended tones
              (especially useful for ambiguous characters).
            </li>
          </ol>
          <li>
            Record yourself saying the phrase you entered using the microphone
            on the right.
          </li>
          <li>
            Adjust playback speed and play the audio. Indicate syllable breaks
            in the recording.
          </li>
          <ol
            style={{ listStyleType: "square", marginLeft: "2em" }}
            className="space-y-1"
          >
            <li>
              Press the grey "Start" button that appears. Every time you are between
              two syllables, press "Mark syllable". Once you're done, press "Stop".
            </li>
          </ol>
        </ol>
      </div>
      </div>
    </div>
  );
};

export default Header;

{

}
