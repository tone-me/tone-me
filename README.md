# Tone.me
Tone.me is a platform built at MIT aimed at improving Mandarin pronunciation.
<br>
Developed by Chris Ge, Daria Kryvosheieva, Anshul Gupta, Riddhi Bhagwat, & Kat Guo


For the predictions to work properly, you'll have to install ffmpeg (brew install ffmpeg on mac)

To run the app, run the following commands on one terminal

npm i next <br>
npm i next react react-dom <br>
virtualenv venv <br>
source venv/bin/activate <br>
pip3 install jsonify flask flask-cors transformers librosa torch <br>
cd [path to tone-me]/app <br>
python3 app.py

and then on another terminal, run 

npm i next <br>
npm i next react react-dom react-table <br>
virtualenv venv <br>
source venv/bin/activate <br>
pip3 install jsonify flask flask-cors transformers librosa torch <br>
cd [path to tone-me]/app  <br>
npm run dev

