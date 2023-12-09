# Tone.me
Tone.me is a platform built at MIT aimed at improving Mandarin pronunciation.
<br>
Developed by Chris Ge, Daria Kryvosheieva, Anshul Gupta, Riddhi Bhagwat, & Katherine Guo


<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/tone-me/tone-me">
    <img src="public/images/logo.png" alt="Logo" width="200" height="80">
  </a>

  <h3 align="center">A Chinese Mandarin Pronunciation Corrector</h3>
</div>



<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#installation-and-setup">Installation and Setup</a>
    </li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>



<!-- ABOUT THE PROJECT -->
## About The Project

<div align="center">
  <a href="https://youtu.be/rbQpK_QUHbY">
    <img src="https://img.youtube.com/vi/rbQpK_QUHbY/0.jpg" alt="Tone-Me Demo" width=800>
  </a>
</div>

Our three-step process accepts a Chinese voice recording,determines the tones in the recording, and returns feedback on the correctness of the tones.

<ol>
  <li> <b>Audio Input.</b> Record an audio of yourself pronouncing a character, word, phrase or sentence. Specify what you want to say.</li>
  <li> <b>Analysis.</b> Our software predicts tones from the audio and compares to the intended ones.</li>
  <li> <b>Feedback.</b> The software returns whether or not your pronunciation was right, and displays the audio of your pronunciation of each syllable compared to an authentic pronunciation</li>
</ol>

We used the [Data-AISHELL3](https://www.openslr.org/93/) Mandarin Speech Corpus as raw data split it into audio segments of individual syllables using [Whisper](https://openai.com/research/whisper) and [stable-ts](https://github.com/jianfch/stable-ts/blob/main/README.md), filtered the syllables using Pydub, and fine-tuned the [wave2vec2](https://huggingface.co/docs/transformers/model_doc/wav2vec2) transformer model on the resulting audio segments. Here's a diagram of our model pipeline:

<div align="center">
  <img src="https://github.com/tone-me/tone-me/assets/88895223/84dd58d6-7c57-4675-9d21-b2c5831b4843" alt="Tone-Me pipeline architecture">
</div>

The code used to train the model is included in the ```model``` folder, but it wasn't written for public distribution and is only included for reference. Our [model](https://huggingface.co/cge7/wav2vec2-base-version3) is publicly available on Hugging Face.  

<p align="right">(<a href="#readme-top">back to top</a>)</p>



### Built With

Some of the main frameworks and libraries that we used in our project

* [![Next][Next.js]][Next-url]
* [![React][React.js]][React-url]
* [![Flask][Flask.com]][Flask-url]
* [![Hugging Face][HuggingFace.com]][HuggingFace-url]

<p align="right">(<a href="#readme-top">back to top</a>)</p>


<!-- INSTALLATION AND SETUP -->
## Installation and Setup 

Our service is no longer hosted on [https://tone-me.onrender.com](https://tone-me.onrender.com) because of cost reasons. However, here is how you can set up Tone-Me for use on your local computer. 

We recommend that you install the following packages within a virtual environment. 
* npm
  ```sh
  npm install
  ```
* pip
* ```sh
  pip install -r requirements.txt
  ```

Then, you can run ```python3 app.py``` in one shell, and ```npm run dev``` in another shell, and access your website at ```localhost:3000```. 

<!-- LICENSE -->
## License

Distributed under the MIT License. See `LICENSE.txt` for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTACT -->
## Contact

Chris Ge - cge7@mit.edu


<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- ACKNOWLEDGMENTS -->
## Acknowledgments

This project would not have been possible without the support from [AIM Labs](https://www.ai-at-mit.com/labs). We're especially grateful to Sagnik Anupam for all of his advice and help. 

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->

[Next.js]: https://img.shields.io/badge/next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white
[Next-url]: https://nextjs.org/
[HuggingFace.com]: https://img.shields.io/badge/%F0%9F%A4%97%20Hugging%20Face-black?style=for-the-badge
[HuggingFace-url]: https://huggingface.co/
[React.js]: https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[React-url]: https://reactjs.org/
[Flask.com]: https://img.shields.io/badge/flask-black?style=for-the-badge&logo=flask&logoColor=FFFFFF
[Flask-url]: https://flask.palletsprojects.com/en/3.0.x/
