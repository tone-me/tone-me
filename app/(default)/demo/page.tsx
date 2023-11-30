"use client";
import RecordingView from "./components/RecordingView";
import "app/globals.css";
import "/app/css/style.css";
import "/app/css/additional-styles/range-slider.css";
import "/app/css/additional-styles/theme.css";
import "app/css/additional-styles/toggle-switch.css";
import "app/css/additional-styles/utility-patterns.css";
import { useState } from "react";
import { useEffect } from "react";

// dependencies: {
//   "@testing-library/jest-dom": "^5.17.0",
//   "@testing-library/react": "^13.4.0",
//   "@testing-library/user-event": "^13.5.0",
//   "react": "^18.2.0",
//   "react-dom": "^18.2.0",
//   "react-icons": "^4.11.0",
//   "react-router-dom": "^6.16.0",
//   "react-scripts": "5.0.1",
//   "styled-components": "^5.3.10",
//   "web-vitals": "^2.1.4"
// }

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

const titleStyle = {
  marginTop: "30px",
  marginBottom: "15px",
  fontSize: "60px",
  color: "#bc6c25",
  fontFamily: "Trebuchet MS",
};

const subtitleStyle = {
  marginTop: "12px",
  fontSize: "30px",
  fontFamily: "Trebuchet MS",
  color: "#d4a373",
};

const fetchData = async () => {
  try {
    let postData = { name: "Hello World" };
    const response = await fetch("/api/fetch_audio", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(postData),
    });
    // const response = await fetch("/api/fetch_audio");
    const data = await response.json();
    console.log("Data from Flask:", data);
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

export default function Home() {
  fetchData();
  return (
    <main className="flex min-h-screen flex-col items-center bg-gray-10">
      <div style={{ color: "black" }}>
        <h1 style={titleStyle}>*✧･ﾟ:* Tone-Me ✧･ﾟ: *✧</h1>
        <p style={subtitleStyle}>
          Your Personal Chinese Mandarin Tone & Pronunciation Assistant
        </p>
        <RecordingView />
      </div>
    </main>
  );
}
