import { useState, useRef } from "react";

const SelectionBox = () => {
    const [tonestring, setTonestring] = useState(null);

    const handleChange = (event) => {
	setTonestring(event.target.value);
    };

    return (
        <div>
            <h2>Specify Tones</h2>
            <main>
            	<input style={{ border: "solid" }} type="tones" id="tones" name="tones" onChange={handleChange}/>
		<p>You've specified: {tonestring}</p>
            </main>
        </div>
    );
};
export default SelectionBox;