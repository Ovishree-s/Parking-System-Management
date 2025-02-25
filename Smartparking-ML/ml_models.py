import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
import pickle  # To save the trained models

# Load dataset
data = pd.read_csv("dataset/parking_data.csv")

# Modify dataset: Set all slots to occupied
print("⚡ Modifying dataset: Setting all slots to occupied...")
data['current_occupancy'] = 1  # Force all slots to be occupied
data['historical_occupancy'] = 1  # (Optional) Update historical occupancy as well

# Ensure consistent encoding using mappings (same as app.py)
day_mapping = {"Monday": 0, "Tuesday": 1, "Wednesday": 2, "Thursday": 3,
               "Friday": 4, "Saturday": 5, "Sunday": 6}
weather_mapping = {"Sunny": 0, "Clear": 0, "Cloudy": 1, "Rainy": 2}
events_mapping = {"No": 0, "Yes": 1}

# Convert categorical columns using mappings
data['day_of_week'] = data['day_of_week'].map(day_mapping)
data['weather'] = data['weather'].map(weather_mapping)
data['nearby_events'] = data['nearby_events'].map(events_mapping)

# Drop any rows with NaN values (if mappings failed)
data = data.dropna()

# Save modified dataset
data.to_csv("dataset/parking_data.csv", index=False)
print("✅ Dataset modification complete. Saved updated CSV.")

# Split features and target labels
X = data[['time_of_day', 'day_of_week', 'weather', 'nearby_events']]  # Ensuring order matches `app.py`
y_slot = data['current_occupancy']  # Target variable for slot prediction
y_price = data['dynamic_price']  # Target variable for pricing

# Train-test split (one consistent split for both models)
X_train, X_test, y_train_slot, y_test_slot = train_test_split(X, y_slot, test_size=0.2, random_state=42)
y_train_price, y_test_price = train_test_split(y_price, test_size=0.2, random_state=42)

# Train slot prediction model
slot_model = RandomForestClassifier(n_estimators=100, random_state=42, class_weight="balanced")  # Handling imbalance
slot_model.fit(X_train, y_train_slot)

# Train dynamic pricing model
price_model = RandomForestRegressor(n_estimators=100, random_state=42)
price_model.fit(X_train, y_train_price)

# Save models for later use
with open("slot_model.pkl", "wb") as f:
    pickle.dump(slot_model, f)

with open("price_model.pkl", "wb") as f:
    pickle.dump(price_model, f)

print("✅ Models trained and saved successfully.")
