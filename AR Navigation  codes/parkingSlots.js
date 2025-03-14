import { database, ref, onValue } from "./firebase-config.js"; // Firebase setup
import parkingSlots from "./parking-data.js"; // Import static slot positions

// Function to update parking slots from Firebase
function updateParkingSlots() {
    const parkingSlotsRef = ref(database, "parkingSlots"); // Firebase path

    onValue(parkingSlotsRef, (snapshot) => {
        const data = snapshot.val();
        let bookedSlots = [];

        // Identify booked slots
        for (let slot in data) {
            if (data[slot] === "booked") {
                bookedSlots.push(slot);
            }
        }

        // Update AR scene dynamically
        updateARScene(bookedSlots);
    });
}

// Function to update A-Frame AR scene dynamically
function updateARScene(bookedSlots) {
    let parkingSlotsEntity = document.getElementById("parkingSlots");
    parkingSlotsEntity.innerHTML = ""; // Clear previous slots

    for (let slotId in parkingSlots) {
        let slot = parkingSlots[slotId]; // Get predefined slot position
        let slotBase = document.createElement("a-box");
        slotBase.setAttribute("position", `${slot.x} 0 ${slot.y}`);
        slotBase.setAttribute("width", "2");
        slotBase.setAttribute("height", "0.5");
        slotBase.setAttribute("depth", "4");

        if (bookedSlots.includes(slotId)) {
            slotBase.setAttribute("color", "green"); // Booked slots = GREEN
        } else {
            slotBase.setAttribute("color", "red"); // Available slots = RED
        }

        let label = document.createElement("a-text");
        label.setAttribute("value", "Slot " + slotId);
        label.setAttribute("position", `${slot.x} 1.5 ${slot.y}`);
        label.setAttribute("align", "center");
        label.setAttribute("color", "black");

        parkingSlotsEntity.appendChild(slotBase);
        parkingSlotsEntity.appendChild(label);
    }
}

// Call function to fetch data and update AR scene
updateParkingSlots();
