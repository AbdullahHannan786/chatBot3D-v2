from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": ["http://localhost:3000","http://localhost:3001"]}})

@app.get("/health")
def health():
    return "ok", 200

@app.post("/reply")
def reply():
    data = request.get_json(force=True) or {}
    text = (data.get("text") or "").strip()
    if not text:
        return jsonify(error="Missing text"), 400
    # TODO: call LLM / your logic here
    return jsonify(reply=f"You said: {text}")

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5001, debug=True)
