import { useState, useRef } from "react";

const SelectionBox = ( {tonestring, setTonestring, setInputText} ) => {
    const onSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        setInputText(formData.get("text-input"))
        setTonestring(formData.get("tone-input"))
    }
    const handleChange = async (event) => {
        try {
            const response = await fetch("http://127.0.0.1:5000/fetch_text", {
              method: "POST",
              mode: "cors",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ text: event.target.value }),
            });
          } catch (error) {
            console.error("Failed to process text:", error);
          }
	    setTonestring(event.target.value);
    };

    return ( <>
        <section className='register-page full-page'>
        <form className='form' onSubmit={onSubmit}>
            <h2> Input the sentence that you want to record</h2>
          {/* name field */}
          {(
            <div className='form-row'>
              <label htmlFor='text-input' className='form-label'>
                Text Input
              </label>
              <input id='text-input' type='text-input' name='text-input' className='form-input' />
            </div>
          )}
  
          {/* email field */}
          <div className='form-row'>
            <label htmlFor='tone-input' className='form-label'>
              Tones
            </label>
            <input id='tone-input' type='tone-input' name='tone-input' className='form-input' />
          </div>
          
          <button type='submit' className='btn btn-block'>
            Save
          </button>
        </form>
      </section>

        <div>
            <h2>Specify Tones</h2>
            <main>
                <input style={{ border: "solid" }} type="tones" id="tones" name="tones" onChange={handleChange}/>
        <p>You"ve specified: {tonestring}</p>
            </main>
        </div>
        </>
    );
};
export default SelectionBox;