// --- Firebase Initialization ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getDatabase, ref, set, push, onValue, remove } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyDbBpMXMGaRkE3WhnBOrp0XP2tAXpn9uu0",
  authDomain: "parking-system-managemen-277b5.firebaseapp.com",
  databaseURL: "https://parking-system-managemen-277b5-default-rtdb.firebaseio.com",
  projectId: "parking-system-managemen-277b5",
  storageBucket: "parking-system-managemen-277b5.firebasestorage.app",
  messagingSenderId: "181875608379",
  appId: "1:181875608379:web:a259a855b8ab5ff934851e"
};

const appFirebase = initializeApp(firebaseConfig);
const database = getDatabase(appFirebase);

// --- Reservation Function ---
function reserveSlot() {
  const userName = document.getElementById("username").value.trim();
  const date = document.getElementById("date").value;
  const time = document.getElementById("time").value;
  const parkingSlot = document.getElementById("parkingSlot").value;

  if (!userName || !date || !time || !parkingSlot) {
    alert("Please fill in all fields!");
    return;
  }

  // Retrieve current reservations
  const reservationsRef = ref(database, 'reservations');
  onValue(reservationsRef, snapshot => {
    const reservations = snapshot.val() || {};
    const slotTaken = Object.values(reservations).some(res => 
      res.date === date && res.time === time && res.parkingSlot === parkingSlot
    );

    if (slotTaken) {
      alert("⚠️ Slot is already reserved! Please choose another slot.");
      return;
    }

    // If slot is available, proceed with reservation
    const newReservationRef = push(reservationsRef);
    set(newReservationRef, {
      user_name: userName,
      date: date,
      time: time,
      parkingSlot: parkingSlot,
      price: 5
    })
    .then(() => {
      alert("✅ Reservation made successfully!");
      getReservations();
      clearReservationForm();
    })
    .catch(error => {
      console.error("Error making reservation:", error);
    });
  }, { onlyOnce: true });
}

function getReservations() {
  const reservationsRef = ref(database, 'reservations');
  onValue(reservationsRef, snapshot => {
    const data = snapshot.val() || {};
    const reservations = Object.keys(data).map(key => ({ id: key, ...data[key] }));
    displayReservations(reservations);
    document.getElementById("reservationCount").innerText = reservations.length;
  });
}

function displayReservations(reservations) {
  const list = document.getElementById("reservations");
  list.innerHTML = "";
  reservations.forEach(reservation => {
    const item = document.createElement("li");
    item.innerHTML = `
      <div>
        <strong>${reservation.user_name}</strong> - ${reservation.date} at ${reservation.time} | Slot: ${reservation.parkingSlot} | Price: $${reservation.price}
      </div>
      <button onclick="deleteReservation('${reservation.id}')">❌ Delete</button>
    `;
    list.appendChild(item);
  });
}

function deleteReservation(id) {
  if (!confirm("Are you sure you want to delete this reservation?")) return;
  const reservationRef = ref(database, 'reservations/' + id);
  remove(reservationRef)
    .then(() => {
      alert("✅ Reservation deleted successfully!");
      getReservations();
    })
    .catch(error => console.error("Error deleting reservation:", error));
}

function clearReservationForm() {
  document.getElementById("username").value = "";
  document.getElementById("date").value = "";
  document.getElementById("time").value = "";
  document.getElementById("parkingSlot").value = "";
}

// Attach functions to window to make them accessible globally
window.reserveSlot = reserveSlot;
window.deleteReservation = deleteReservation;
window.getReservations = getReservations;
