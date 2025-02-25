from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import traceback

app = Flask(__name__)

# Enable CORS for all routes and any origins
CORS(app, resources={r"/predict": {"origins": "*"}})

# Load trained models
slot_model = pickle.load(open("slot_model.pkl", "rb"))
price_model = pickle.load(open("price_model.pkl", "rb"))

# Mappings for categorical inputs (note: "Clear" added)
day_mapping = {"Monday": 0, "Tuesday": 1, "Wednesday": 2, "Thursday": 3,
               "Friday": 4, "Saturday": 5, "Sunday": 6}
weather_mapping = {"Sunny": 0, "Clear": 0, "Cloudy": 1, "Rainy": 2}

@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json()
        print(f"\n[DEBUG] Received data from frontend: {data}")

        # Extract raw inputs
        day_of_week_raw = data.get("day_of_week", "")
        time_of_day_raw = data.get("time_of_day", 0)
        weather_raw = data.get("weather", "")
        events_raw = data.get("nearby_events", "No")

        print(f"[DEBUG] Raw Inputs -> day_of_week: {day_of_week_raw}, "
              f"time_of_day: {time_of_day_raw}, weather: {weather_raw}, events: {events_raw}")

        # Map day and weather
        day_of_week = day_mapping.get(day_of_week_raw, -1)
        weather = weather_mapping.get(weather_raw, -1)

        # Validate and convert time_of_day
        try:
            time_of_day = int(time_of_day_raw)
            if not (0 <= time_of_day <= 23):
                return jsonify({"error": "Invalid time_of_day (must be between 0 and 23)"}), 400
        except ValueError:
            return jsonify({"error": "Invalid time_of_day (must be an integer)"}), 400

        # Convert nearby_events ("Yes"/"No") to integer
        if events_raw == "Yes":
            nearby_events = 1
        elif events_raw == "No":
            nearby_events = 0
        else:
            return jsonify({"error": "Invalid nearby_events value (must be 'Yes' or 'No')"}), 400

        # Check if the mappings succeeded
        if day_of_week == -1 or weather == -1:
            return jsonify({"error": "Invalid categorical input (day_of_week or weather)"}), 400

        # Prepare input features for the models
        input_features = [[time_of_day, day_of_week, weather, nearby_events]]
        print(f"[DEBUG] Final feature vector: {input_features}")

        # Make predictions using the loaded models
        slot_available = slot_model.predict(input_features)[0]
        suggested_price = price_model.predict(input_features)[0]

        # Build response
        response = {
            "slot_available": bool(slot_available),
            "suggested_price": round(float(suggested_price), 2)
        }
        print(f"[DEBUG] Response to frontend: {response}\n")
        return jsonify(response)

    except Exception as e:
        print("[ERROR] An exception occurred:")
        traceback.print_exc()
        return jsonify({"error": f"Server error. Details: {str(e)}"}), 500

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
