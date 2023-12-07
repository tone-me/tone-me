import React from "react";
import Link from "next/link";
import "app/globals.css";
/* eslint-disable react/no-unescaped-entities */

const Navbar = () => {
  return (
    <>
      <div className="w-full h-20 bg-emerald-800 sticky top-0">
        <div className="container mx-auto px-4 h-full">
          <div className="flex justify-between items-center h-full">
            <ul className="hidden md:flex gap-x-6 text-white">
              <li>
                <Link href="/">
                  <p>Home</p>
                </Link>
              </li>
              <li>
                <Link href="/myrecordings">
                  <p>My Recordings</p>
                </Link>
                {/* ^a place to display old recordings + view old scores; 
                will be useful for testing purposes */}
              </li>
              <li>
                {/* <Link href="/newrecording">
                  <p>New Recordings</p>
                </Link> */}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
