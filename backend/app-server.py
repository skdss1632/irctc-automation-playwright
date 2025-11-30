import argparse
import numpy as np
from PIL import Image
import io
import base64
import easyocr
from flask import Flask, request, jsonify
from flask_cors import CORS  # pip install flask-cors

# ---------- OCR SETUP ----------

reader = easyocr.Reader(["en"], model_storage_directory="./EasyOCR")

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000"])  # React dev server

# In‑memory config store (you can later persist to file/DB)
CONFIG_STATE = {
    "TRAIN_NO": "",
    "TRAIN_COACH": "SL",
    "TRAVEL_DATE": "",
    "SOURCE_STATION": "",
    "BOARDING_STATION": "",
    "DESTINATION_STATION": "",
    "TATKAL": False,
    "PREMIUM_TATKAL": False,
    "UPI_ID_CONFIG": "@ybl",
    "PASSENGER_DETAILS": [],
    "USERNAME": "",
    "PASSWORD": "",
    "AUTOCAPTCHA": False,
}


def extract_text_from_image(base64_image: str) -> str:
    try:
        image_bytes = base64.b64decode(base64_image.split(",")[-1])
        image_buffer = io.BytesIO(image_bytes)
        image = Image.open(image_buffer).convert("L")
        open_cv_image = np.array(image)
        result = reader.readtext(open_cv_image, detail=0)
        if result:
            return result[0].replace(" ", "")
        return "ABCDEF"
    except Exception as e:
        return f"Error processing image: {str(e)}"


# ---------- OCR ROUTE ----------

@app.route("/extract-text", methods=["POST"])
def extract_text():
    data = request.get_json(silent=True) or {}
    base64_image = data.get("image", "")

    if not base64_image:
        return jsonify({"error": "No base64 image string provided"}), 400

    extracted_text = extract_text_from_image(base64_image)
    return jsonify({"extracted_text": extracted_text})


# ---------- CONFIG ROUTES FOR REACT UI ----------

@app.route("/config", methods=["GET"])
def get_config():
    """Return current config for frontend."""
    return jsonify(CONFIG_STATE), 200


@app.route("/config", methods=["POST"])
def save_config():
    """Save config JSON sent by frontend."""
    global CONFIG_STATE
    data = request.get_json(silent=True) or {}

    # Optional: basic validation
    required_keys = [
        "TRAIN_NO",
        "TRAIN_COACH",
        "TRAVEL_DATE",
        "SOURCE_STATION",
        "DESTINATION_STATION",
        "PASSENGER_DETAILS",
    ]
    for key in required_keys:
        if key not in data:
            return jsonify({"error": f"Missing field: {key}"}), 400
    print(">>> UPDATED CONFIG_STATE:", CONFIG_STATE)
    CONFIG_STATE.update(data)
    return jsonify({"status": "ok"}), 200


@app.route("/")
def health_check():
    return "Server is running", 200


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Run the OCR + config server.")
    parser.add_argument(
        "--host",
        type=str,
        default="0.0.0.0",
        help="Host address to run the server on (default: 0.0.0.0)",
    )
    parser.add_argument(
        "--port",
        type=int,
        default=5000,
        help="Port to run the server on (default: 5000)",
    )
    args = parser.parse_args()

    app.run(host=args.host, port=args.port, debug=True)
