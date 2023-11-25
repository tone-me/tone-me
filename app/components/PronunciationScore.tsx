import {useState} from 'react'


var result
//BELOW: connecting python portion
const postData = async (data) => {
  const response = await fetch('./app', {
    method: 'POST',
    body: JSON.stringify(data),
  });

  if (response.ok) {
    const result = await response.json();
    console.log('Pronunciation Score:', result);
  } else {
    console.error('Error:', response.statusText);
  }
};
export default function PronunciationScoring() {
    const [score, setScore] = useState<string>("");
    const handleScoring = async () => {
        const inputData = { /* INPUT DATA FROM AUDIO JSON */ };
        try {
        const response = await postData(inputData);
        setScore(response.result);
        } catch (error) {
        console.error('error lol', error);
        }
    }

    return (
        <div className="flex items-center justify-center h-screen w-full">
            {/*frontend component to be viewed*/}
            <button onClick={PronunciationScoring}>
                Score My Recording
            </button>
            <p>Score: {score}</p>
        </div>
    )

}


  
      
