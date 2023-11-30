import {useState} from 'react'


var result
//BELOW: connecting python portion
const postData = async (data: Blob) => {
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

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end(); // Method Not Allowed
  }

  const formData = req.body;
  const audioBlob = formData.get('audio');

  // converting Blob to a base64-encoded string
  const base64AudioData = await audioBlob.arrayBuffer();
  const base64String = Buffer.from(base64AudioData).toString('base64');

  // sending the base64-encoded audio data to the client
  res.status(200).json({ audio: base64String });
}


  
      
