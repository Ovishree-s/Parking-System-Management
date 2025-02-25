// Import Firebase SDKs (modular approach for v9+)
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getDatabase, ref, set, push, get, onValue, remove } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-database.js";

// Firebase config object (replace with your own config from Firebase Console)
const firebaseConfig = {
    apiKey: "AIzaSyDbBpMXMGaRkE3WhnBOrp0XP2tAXpn9uu0",
    authDomain: "parking-system-managemen-277b5.firebaseapp.com",
    databaseURL: "https://parking-system-managemen-277b5-default-rtdb.firebaseio.com",
    projectId: "parking-system-managemen-277b5",
    storageBucket: "parking-system-managemen-277b5.firebasestorage.app",
    messagingSenderId: "181875608379",
    appId: "1:181875608379:web:a259a855b8ab5ff934851e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Set minimum date to today
document.getElementById("date").setAttribute("min", new Date().toISOString().split("T")[0]);

// Fetch reservations from Firebase
function getReservations() {
    const reservationsRef = ref(database, 'reservations');
    
    onValue(reservationsRef, (snapshot) => {
        const data = snapshot.val() || {};
        const reservations = Object.keys(data).map(key => ({ id: key, ...data[key] }));
        updateReservationCount(reservations);
        displayReservations(reservations);
    });
}

// Display reservations in the UI
function displayReservations(data) {
    const list = document.getElementById("reservations");
    list.innerHTML = "";
    data.forEach(reservation => {
        const item = document.createElement("li");
        item.innerHTML = `
            <div>
                <strong>${reservation.user_name}</strong> - ${reservation.date} at ${reservation.time} | Slot: ${reservation.parkingSlot}
            </div>
            <button onclick="deleteReservation('${reservation.id}')">❌ Delete</button>
        `;
        list.appendChild(item);
    });
}

// Add reservation
function reserveSlot() {
    const userName = document.getElementById("username").value;
    const date = document.getElementById("date").value;
    const time = document.getElementById("time").value;
    const parkingSlot = document.getElementById("parkingSlot").value;

    if (!userName || !date || !time || !parkingSlot) {
        alert("Please fill in all fields!");
        return;
    }

    const newReservationRef = push(ref(database, 'reservations'));
    set(newReservationRef, {
        user_name: userName,
        date,
        time,
        parkingSlot
    })
    .then(() => {
        alert("Reservation made successfully!");
        getReservations();
        clearForm();
    })
    .catch((error) => {
        console.error("Error making reservation:", error);
    });
}

// Delete reservation
function deleteReservation(id) {
    if (!confirm("Are you sure you want to delete this reservation?")) return;

    const reservationRef = ref(database, 'reservations/' + id);
    remove(reservationRef)
        .then(() => {
            alert("Reservation deleted successfully!");
            getReservations();
        })
        .catch((error) => {
            console.error("Error deleting reservation:", error);
        });
}

// Update reservation count
function updateReservationCount(data) {
    document.getElementById("reservationCount").textContent = `Total Reservations: ${data.length}`;
}

// Clear form
function clearForm() {
    document.getElementById("username").value = '';
    document.getElementById("date").value = '';
    document.getElementById("time").value = '';
    document.getElementById("parkingSlot").value = '';
}

// Initial fetch of reservations
getReservations();
