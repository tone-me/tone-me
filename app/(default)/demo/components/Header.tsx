import React from "react";
import Link from "next/link";

const Header = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6">
      {/* Hero content */}
      <div className="pt-32 pb-12 md:pt-40 md:pb-20">
        {/* Section header */}
        <div className="text-center">
          <h1
            className="text-5xl md:text-6xl font-extrabold leading-tighter tracking-tighter mb-4"
            data-aos="zoom-y-out"
          >
            *✧･ﾟ:* Tone-Me *:ﾟ･✧*
            <div className=" text-3xl md:text-3xl bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-teal-400">
              Your Personal Chinese Mandarin Tone & Pronunciation Assistant
            </div>
          </h1>
        </div>
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
