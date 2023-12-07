import React from "react";
import Link from "next/link";
/* eslint-disable react/no-unescaped-entities */

const Header = () => {
  return (
    <div className="">
      <div
        className="absolute left-1/2 transform -translate-x-1/2 bottom-0 pointer-events-none -z-1"
        aria-hidden="true"
      >
        <svg
          width="1360"
          height="800"
          viewBox="0 0 1360 578"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient
              x1="50%"
              y1="0%"
              x2="50%"
              y2="100%"
              id="illustration-01"
            >
              <stop stopColor="#FFF" offset="0%" />
              <stop stopColor="#EAEAEA" offset="77.402%" />
              <stop stopColor="#DFDFDF" offset="100%" />
            </linearGradient>
          </defs>
          <g fill="url(#illustration-01)" fillRule="evenodd">
            <circle cx="1232" cy="128" r="128" />
            <circle cx="155" cy="443" r="64" />
          </g>
        </svg>
      </div>
      {/* Hero content */}
      <div className="pt-32 relative w-screen mx-auto flex flex-row container">
        {/* Section header */}
        <div className="text-left text-3xl mb-2 bg-gray-900 p-4 h3 text-white rounded-lg">
          Tone-Me{" "}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-teal-400">
            Demo
          </span>{" "}
        </div>
      </div>
      <div
        data-aos="zoom-y-out"
        className="mt-10 relative w-screen mx-auto flex flex-row items-center justify-center container text-xl py-10 text-left bg-gray-200 backdrop-blur-lg rounded-xl m-0"
      >
        <ol className="list-decimal space-y-3 list-inside">
          <li>
            Submit the Mandarin Chinese sentence or phrase you want to say on
            the left below.
          </li>
          <ol style={{ listStyleType: "lower-alpha", marginLeft: "2em" }}>
            <li>
              For higher accuracy, you may also submit intended tones
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
            style={{ listStyleType: "lower-alpha", marginLeft: "2em" }}
            className="space-y-1"
          >
            <li>
              Press the grey "Start" button that appears. Every time are between
              two syllables, press "Mark syllable".
            </li>
            <li>
              Once you're done, press "Stop". Results should aggregate on a
              table after processing the input data.
            </li>
          </ol>
        </ol>
      </div>
    </div>
  );
};

export default Header;

{
  /* <h1 style={titleStyle}>*✧･ﾟ:* Tone-Me ✧･ﾟ: *✧</h1>
        <p style={subtitleStyle}>
          Your Personal Chinese Mandarin Tone & Pronunciation Assistant
        </p> */
}
