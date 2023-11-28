'use client'
import { useState } from "react";
import { useRef } from "react";
import { useEffect } from "react";

declare global {
    interface Window {
        webkitSpeechRecognition:any;

    }
}
export default function RecordingView() {
    const [isRecording, setIsRecording] = useState<boolean>(false);
    const [recordingComplete, setRecordingComplete] = useState<boolean>(false);
    const [transcript, setTranscript] = useState<string>("");

    const recognitionRef = useRef<any>(null);

    const startRecording = () => {
        setIsRecording(true);

        recognitionRef.current = new window.webkitSpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.onresult = (event:any) => {
            const {transcript} = event.results[event.results.length -1][0];

            setTranscript(transcript)
        }

        recognitionRef.current.start()

        // setTranscript("Phrase");
    };

    useEffect(() => {
        return () => {
            if (recognitionRef.current){
                recognitionRef.current.stop();
            }
        }
    }, [])


    const stopRecording = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            setRecordingComplete(true);
        }
    };

    const handleToggleRecording = () => {
        setIsRecording(!isRecording)
        if(!isRecording){
            startRecording();
        } else{
            stopRecording();
        }

    }

    return (
        <div className="flex items-center justify-center h-screen w-full">
            {/* Transcript Section */}
            <div className="justify-center align-items-center w-full">
            {(isRecording || transcript) && (
                <div className="w-1/4 m-autp rounded-md border p-4 bg-white">
                    <div className="flex-1 flex w-full justify-between">
                        <div className="space-y-1">
                            <p className="justify-center text-sm font-medium leading-none">
                                {isRecording ? "Recording" : "Recorded"}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {recordingComplete ? "Your pronunciation is being processed." : "Start speaking..."}
                            </p>
                            </div>
                            {isRecording && (
                                <div className="rounded-full w-4 h-4 bg-red-400 animate-pulse"/>

                            )}
                    </div>
                </div>
            )}
            {transcript && (
                <div className="border rounded-md p-2 h-fullm mt-4">
                    <p className="mb-0">(transcript)</p>
                </div>
            )}
            
            {/* Buttons */}
            <div className = "flex items-center w-full">
                {isRecording ? (
                    <button 
                        onClick={(handleToggleRecording)}
                        className="rounded-full mt-10 m-auto flex items-center justify-center bg-red-200 hover:bg-red-400">
                            <svg width="40" height="40" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
                                        <path d="M21 12a9 9 0 1 1-18 0a9 9 0 0 1 18 0Z"/>
                                        <path d="M9 10a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-4Z"/>
                                    </g>
                                </svg>
                                
                        </button>
                    
                ) : (
                    <button
                        onClick={(handleToggleRecording)}
                        className="rounded-full mt-10 m-auto flex items-center justify-center bg-blue-200 hover:bg-blue-400">
                            <svg width="40" height="40" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <g fill="none" stroke="currentColor" stroke-linejoin="round" stroke-width="1.2">
                                    <rect width="6" height="11" x="9" y="3" fill="currentColor" fill-opacity=".25" rx="3"/>
                                    <path stroke-linecap="round" d="M5.4 11a6.6 6.6 0 1 0 13.2 0M12 21v-2"/>
                                </g>
                            </svg>
                        </button>
                )}
            </div>
        </div>
        </div>
    )
}