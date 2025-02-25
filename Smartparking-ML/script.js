async function predictParking() {
  // Get user inputs from the form
  let day = document.getElementById("day").value;
  let time = document.getElementById("time").value;
  let weather = document.getElementById("weather").value;
  let events = document.getElementById("events").value;

  // Prepare JSON object to send to Flask API
  let requestData = {
    day_of_week: day,
    time_of_day: time,       // Must be between 0 and 23
    weather: weather,        // Should be one of "Clear", "Cloudy", "Rainy"
    nearby_events: events    // "Yes" or "No"
  };

  console.log("Sending data:", requestData);  // For debugging

  try {
    // Send a POST request to your Flask API
    let response = await fetch("http://127.0.0.1:5000/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestData)
    });

    if (!response.ok) throw new Error("Server error: " + response.status);

    let result = await response.json();
    console.log("Received result:", result); // For debugging

    // Update the webpage with the prediction results
    document.getElementById("slotPredictionResult").innerText = 
      "Slot Availability: " + (result.slot_available ? "Yes" : "No");
    document.getElementById("pricePredictionResult").innerText = 
      "Dynamic Price: $" + result.suggested_price;
  } catch (error) {
    console.error("Error:", error);
    document.getElementById("slotPredictionResult").innerText = 
      "Error retrieving prediction.";
    document.getElementById("pricePredictionResult").innerText = "";
  }
}
