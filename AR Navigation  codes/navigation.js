import { db } from "./firebase-config.js";
import parkingSlots from "./parking-data.js";

function loadNavigation() {
    db.ref("bookedSlot").once("value", snapshot => {
        let bookedSlot = snapshot.val();
        if (bookedSlot && parkingSlots[bookedSlot]) {
            let slotPosition = parkingSlots[bookedSlot];
            createNavigationPath(slotPosition.x, slotPosition.y);
        }
    });
}

function createNavigationPath(targetX, targetY) {
    let scene = document.querySelector("a-scene");

    // Create arrows leading to booked slot
    for (let i = 0; i <= targetX; i += 2) {
        let arrow = document.createElement("a-entity");
        arrow.setAttribute("geometry", "primitive: cone; height: 1; radiusBottom: 0.5");
        arrow.setAttribute("material", "color: red");
        arrow.setAttribute("position", `${i} 0 -2`);
        arrow.setAttribute("rotation", "-90 0 0");
        scene.appendChild(arrow);
    }
}

// Load navigation when page loads
window.onload = loadNavigation;
