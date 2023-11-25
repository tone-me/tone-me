#goal: expose endpoints of ai transformer model 

from flask import Flask, request, jsonify
from flask_cors import CORS
app = Flask(__name__)
CORS(app)
@app.route('/process-audio', methods=['POST'])
def process_audio():
    data = request.json 
    # result = *AI MODEL FUNCTION* (data)
    # return jsonify(result)

if __name__ == "__main__":
    app.run(debug=True)