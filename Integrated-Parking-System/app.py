from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import numpy as np
import firebase_admin
from firebase_admin import credentials, db

# Initialize Flask app and CORS
app = Flask(__name__)
CORS(app)  # Enable CORS for cross-origin requests

# Firebase initialization
cred = credentials.Certificate('C:/Users/HP/OneDrive/Desktop/integrated-parking-system/backend/serviceAccountKey.json')  # Path to Firebase key
firebase_admin.initialize_app(cred, {
    'databaseURL': 'https://your-database-name.firebaseio.com/'  # Replace with your Firebase Database URL
})

# Load trained ML models
with open('slot_model.pkl', 'rb') as f:
    slot_model = pickle.load(f)

with open('price_model.pkl', 'rb') as f:
    price_model = pickle.load(f)

# Mappings for categorical inputs
day_mapping = {"Monday": 0, "Tuesday": 1, "Wednesday": 2, "Thursday": 3, "Friday": 4, "Saturday": 5, "Sunday": 6}
time_mapping = {"Morning": 0, "Afternoon": 1, "Evening": 2}
weather_mapping = {"Sunny": 0, "Cloudy": 1, "Rainy": 2}

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        
        # Extract and validate inputs
        day_of_week = data.get("day_of_week", "").strip()
        time_of_day = data.get("time_of_day", "").strip()
        is_holiday = data.get("is_holiday", "").strip()
        weather_condition = data.get("weather_condition", "").strip()
        nearby_events = data.get("nearby_events", "").strip()

        # Convert categorical values
        day_val = day_mapping.get(day_of_week, -1)
        time_val = time_mapping.get(time_of_day, -1)
        weather_val = weather_mapping.get(weather_condition, -1)

        # Convert "Yes"/"No" to integer (0 or 1)
        if is_holiday.lower() == "yes":
            is_holiday = 1
        elif is_holiday.lower() == "no":
            is_holiday = 0
        else:
            return jsonify({"error": "Invalid value for 'is_holiday'. Use 'Yes' or 'No'."}), 400

        # Check for valid input mappings
        if day_val == -1 or time_val == -1 or weather_val == -1:
            return jsonify({"error": "Invalid input values. Check 'day_of_week', 'time_of_day', or 'weather_condition'."}), 400

        # Prepare input feature vector (MATCH EXACT TRAINING FEATURES)
        features = np.array([[day_val, time_val, is_holiday, weather_val]])  # ONLY 4 FEATURES

        # Make predictions
        slot_pred = slot_model.predict(features)[0]  # 0 or 1 for availability
        price_pred = price_model.predict(features)[0]  # Predicted price

        # Format response
        response_data = {
            "slot_availability": bool(slot_pred),
            "predicted_price": round(float(price_pred), 2)
        }

        # Store prediction in Firebase
        db.reference('reservations').push({
            "day_of_week": day_of_week,
            "time_of_day": time_of_day,
            "is_holiday": bool(is_holiday),
            "weather_condition": weather_condition,
            "slot_availability": bool(slot_pred),
            "predicted_price": round(float(price_pred), 2)
        })

        return jsonify(response_data)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host="127.0.0.1", port=5000, debug=True)
