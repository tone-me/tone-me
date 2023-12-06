import React from "react";
import Link from "next/link";

const Header = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6">
      {/* Hero content */}
      <div className="pt-32">
        {/* Section header */}
        <div className="text-center">
          <h1
            className="xxl:text-5xl xl:text-5xl lg:text-5xl md:text-5xl sm:text-5xl text-3xl font-extrabold leading-tighter tracking-tighter"
            data-aos="zoom-y-out"
          >
            *✧･ﾟ:* Tone-Me *:ﾟ･✧*
            <div className="pt-4 xxl:text-4xl xl:text-4xl lg:text-4xl md:text-4xl sm:text-4xl text-2xl bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-teal-400">
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
