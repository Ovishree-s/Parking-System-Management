from flask import Flask, request, jsonify
import numpy as np
import joblib
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend integration

# Load pre-trained models
try:
    slot_model = joblib.load("slot_model.pkl")
    price_model = joblib.load("price_model.pkl")
    print("✅ ML Models Loaded Successfully!")

    # Print expected feature names for debugging
    expected_features_slot = slot_model.feature_names_in_
    expected_features_price = price_model.feature_names_in_
    print(f"📊 Expected Features for slot_model: {expected_features_slot}")
    print(f"📊 Expected Features for price_model: {expected_features_price}")

except Exception as e:
    print(f"❌ Error loading models: {e}")

# ✅ Define mappings for categorical variables
time_mapping = {"Morning": 0, "Afternoon": 1, "Evening": 2, "Night": 3}
day_mapping = {
    "Monday": 0, "Tuesday": 1, "Wednesday": 2, "Thursday": 3, "Friday": 4,
    "Saturday": 5, "Sunday": 6
}
weather_mapping = {"Sunny": 0, "Cloudy": 1, "Rainy": 2, "Snowy": 3}
event_mapping = {"None": 0, "Concert": 1, "Festival": 2, "Sports": 3}

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        print(f"📥 Received Data: {data}")  # Debugging JSON content

        if not data:
            return jsonify({"error": "❌ No data received in the request!"}), 400

        # Convert all keys to lowercase for consistency
        data = {k.lower(): v for k, v in data.items()}

        # Expected features
        required_features = ['time_of_day', 'day_of_week', 'weather', 'nearby_events']
        missing_features = [feat for feat in required_features if feat not in data]

        if missing_features:
            return jsonify({"error": f"❌ Missing input values: {missing_features}"}), 400

        # ✅ Convert categorical values to numeric
        input_features = [
            time_mapping.get(data['time_of_day'], -1),
            day_mapping.get(data['day_of_week'], -1),
            weather_mapping.get(data['weather'], -1),
            event_mapping.get(data['nearby_events'], -1)
        ]

        # Check if any value is still -1 (meaning invalid input)
        if -1 in input_features:
            return jsonify({"error": "❌ Invalid input values! Check time_of_day, day_of_week, weather, or nearby_events"}), 400

        # Convert to NumPy array and reshape for model
        input_features = np.array([input_features]).astype(float)

        # Debugging: Print final numeric input
        print(f"🔢 Numeric Input for Model: {input_features}")

        # ✅ Make predictions
        slot_prediction = slot_model.predict(input_features)[0]
        price_prediction = price_model.predict(input_features)[0]

        print(f"✅ Predicted Slots: {slot_prediction}, Predicted Price: {price_prediction}")

        return jsonify({
            "predicted_slots": int(slot_prediction),
            "predicted_price": float(price_prediction)
        })

    except Exception as e:
        print(f"❌ Server Error: {str(e)}")
        return jsonify({"error": f"Internal Server Error: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(debug=True)
