// ✅ Ensure Firebase is initialized before calling any function
document.addEventListener("DOMContentLoaded", function () {
  // ✅ Firebase Configuration
  const firebaseConfig = {
      apiKey: "AIzaSyDbBpMXMGaRkE3WhnBOrp0XP2tAXpn9uu0",
      authDomain: "parking-system-managemen-277b5.firebaseapp.com",
      databaseURL: "https://parking-system-managemen-277b5-default-rtdb.firebaseio.com",
      projectId: "parking-system-managemen-277b5",
      storageBucket: "parking-system-managemen-277b5.appspot.com",
      messagingSenderId: "181875608379",
      appId: "1:181875608379:web:a259a855b8ab5ff934851e"
  };

  // ✅ Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  console.log("✅ Firebase Initialized!");

  // ✅ Fetch reservations only after Firebase is initialized
  getReservations();
});

// ✅ Utility function to get input values safely
function getElementValue(id) {
  return document.getElementById(id)?.value?.trim() || "";
}

// ✅ Reservation Logic (Firebase)
function reserveSlot() {
  console.log("✅ Reserve button clicked!");

  const username = getElementValue("username");
  const date = getElementValue("date");
  const time = getElementValue("time");
  const parkingSlot = getElementValue("parkingSlot");

  if (!username || !date || !time || !parkingSlot) {
      alert("⚠️ Please fill in all reservation details!");
      return;
  }

  const reservationData = { username, date, time, parkingSlot };

  console.log("📌 Storing Reservation:", reservationData);

  // ✅ Save to Firebase
  firebase.database().ref("reservations").push(reservationData)
      .then(() => {
          console.log("✅ Reservation saved successfully!");
          getReservations(); // Refresh reservation list
      })
      .catch((error) => {
          console.error("❌ Error saving reservation:", error);
      });
}

// ✅ Fetch and Display Reservations
function getReservations() {
  console.log("📡 Fetching reservations...");

  const reservationsList = document.getElementById("reservations");
  reservationsList.innerHTML = ""; // Clear previous entries

  firebase.database().ref("reservations").once("value")
      .then(snapshot => {
          let count = 0;
          snapshot.forEach(childSnapshot => {
              const data = childSnapshot.val();
              const listItem = document.createElement("li");
              listItem.textContent = `${data.username} - ${data.date} at ${data.time} (Slot ${data.parkingSlot})`;
              reservationsList.appendChild(listItem);
              count++;
          });
          document.getElementById("reservationCount").innerText = count;
          console.log("✅ Reservations updated!");
      })
      .catch(error => {
          console.error("❌ Error fetching reservations:", error);
      });
}

// ✅ Predict Parking Slots using Flask API
function predictParking() {
  console.log("🔍 Predict button clicked!");

  let day_of_week = getElementValue("day_of_week");
  let time_of_day = getElementValue("time_of_day");
  let weather = getElementValue("weather");
  let nearby_events = getElementValue("nearby_events").trim();

  console.log("🛠️ Raw Inputs:", { day_of_week, time_of_day, weather, nearby_events });

  // ✅ Validate required fields
  if (!day_of_week || !time_of_day || !weather) {
      alert("⚠️ Please fill in all required fields!");
      return;
  }

  // ✅ Ensure correct values for nearby_events
  if (nearby_events === "0") {
      nearby_events = "None";  // Convert "0" to "None"
  }

  // ✅ Correct JSON format
  const requestData = {
      day_of_week: day_of_week,
      time_of_day: time_of_day,
      weather: weather,
      nearby_events: nearby_events  // ✅ Fixed key
  };

  console.log("📡 Sending data to API:", requestData);

  // ✅ Send POST request to Flask API
  fetch("http://127.0.0.1:5000/predict", {
      method: "POST",
      headers: { 
          "Content-Type": "application/json"
      },
      body: JSON.stringify(requestData)
  })
  .then(response => {
      if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
  })
  .then(data => {
      console.log("✅ API Response:", data);
      document.getElementById("slotAvailability").innerText = `Slot Availability: ${data.predicted_slots}`;
      document.getElementById("dynamicPrice").innerText = `Dynamic Price per Hour: ₹${data.predicted_price}`;
  })
  .catch(error => {
      console.error("❌ Error fetching prediction:", error);
  });
}

// ✅ Attach functions globally so they work in HTML
window.reserveSlot = reserveSlot;
window.getReservations = getReservations;
window.predictParking = predictParking;
