// "use client"
// import RecordingView from "./components/WorkingRecordingView"
// import "./globals.css"
// import {useState} from "react"

// // dependencies: {
// //   "@testing-library/jest-dom": "^5.17.0",
// //   "@testing-library/react": "^13.4.0",
// //   "@testing-library/user-event": "^13.5.0",
// //   "react": "^18.2.0",
// //   "react-dom": "^18.2.0",
// //   "react-icons": "^4.11.0",
// //   "react-router-dom": "^6.16.0",
// //   "react-scripts": "5.0.1",
// //   "styled-components": "^5.3.10",
// //   "web-vitals": "^2.1.4"
// // }

// import {
//     BrowserRouter as Router,
//     Routes,
//     Route,
// } from "react-router-dom";

// const titleStyle = {
//   marginTop:"30px",
//   marginBottom: "15px",
//   fontSize: "60px",
//   color: "#bc6c25",
//   fontFamily: "Trebuchet MS"
// }

// const subtitleStyle = {
//   marginTop: "12px",
//   fontSize: "30px",
//   fontFamily: "Trebuchet MS",
//   color: "#d4a373"
// }

export const metadata = {
  title: "Home - Tone.me",
  description: "About Tone.me",
};

import Header from "../components/header";
import Hero from "../components/hero";
import Features from "../components/features";
import FeaturesBlocks from "../components/features-blocks";
import Footer from "../components/footer";
/* eslint-disable react/no-unescaped-entities */

export default function Home() {
  return (
    <>
      <Header />
      <Hero />
      <Features />
      <FeaturesBlocks />
      <Footer />
    </>
  );
}
