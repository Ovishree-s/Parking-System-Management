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
try:
    cred = credentials.Certificate('C:/Users/HP/OneDrive/Desktop/integrated-parking-system/backend/serviceAccountKey.json')
    firebase_admin.initialize_app(cred, {
        'databaseURL': 'https://parking-system-managemen-277b5-default-rtdb.firebaseio.com/reservations'  # Replace with your Firebase Database URL
    })
    firebase_initialized = True
except Exception as e:
    print(f"Firebase initialization error: {e}")
    firebase_initialized = False

# Load trained ML models
try:
    with open('slot_model.pkl', 'rb') as f:
        slot_model = pickle.load(open("slot_model.pkl", "rb"))

    with open('price_model.pkl', 'rb') as f:
        price_model = pickle.load(open("price_model.pkl", "rb"))
except Exception as e:
    print(f"Error loading models: {e}")
    slot_model, price_model = None, None

# Mappings for categorical inputs
day_mapping = {"Monday": 0, "Tuesday": 1, "Wednesday": 2, "Thursday": 3, "Friday": 4, "Saturday": 5, "Sunday": 6}
time_mapping = {"Morning": 0, "Afternoon": 1, "Evening": 2}
weather_mapping = {"Sunny": 0, "Cloudy": 1, "Rainy": 2}
holiday_mapping = {"No": 0, "Yes": 1}  # New mapping for holiday feature

@app.route('/predict', methods=['POST'])
def predict():
    try:
        if not slot_model or not price_model:
            return jsonify({"error": "ML models not loaded properly."}), 500

        data = request.get_json()
        print("Received Data from Frontend:", data)

        # Extract and validate inputs
        day_of_week = data.get("day_of_week", "").strip()
        time_of_day = data.get("time_of_day", "").strip()
        weather_condition = data.get("weather_condition", "").strip()
        is_holiday = bool(data.get("is_holiday", False))  # Ensure it is always a boolean

        print(f"Extracted Values -> Day: {day_of_week}, Time: {time_of_day}, Weather: {weather_condition}, Holiday: {is_holiday}")

        # Convert categorical values
        day_val = day_mapping.get(day_of_week, -1)
        time_val = time_mapping.get(time_of_day, -1)
        weather_val = weather_mapping.get(weather_condition, -1)
        holiday_val = holiday_mapping.get(is_holiday, -1)  # Convert holiday value

        # Check for valid input mappings
        if day_val == -1 or time_val == -1 or weather_val == -1 or holiday_val == -1:
            return jsonify({"error": "Invalid input values. Check 'day_of_week', 'time_of_day', 'weather_condition', or 'is_holiday'."}), 400

        # Prepare input feature vector (NOW 4 FEATURES)
        features = np.array([[day_val, time_val, weather_val, int(is_holiday)]])  # Convert boolean to int (0 or 1)


        # Make predictions
        slot_pred = slot_model.predict(features)[0]  # 0 or 1 for availability
        price_pred = price_model.predict(features)[0]  # Predicted price

        # Format response
        response_data = {
            "slot_availability": bool(slot_pred),
            "predicted_price": round(float(price_pred), 2)
        }
        print("Prediction Output:", response_data)

        # Store prediction in Firebase if initialized
        if firebase_initialized:
            db.reference('reservations').push({
                "day_of_week": day_of_week,
                "time_of_day": time_of_day,
                "weather_condition": weather_condition,
                "is_holiday": is_holiday,  # Store holiday status in Firebase
                "slot_availability": bool(slot_pred),
                "predicted_price": round(float(price_pred), 2)
            })

        return jsonify(response_data)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host="127.0.0.1", port=5000, debug=True)
