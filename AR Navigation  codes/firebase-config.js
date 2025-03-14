// Import Firebase SDK modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-database.js";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDbBpMXMGaRkE3WhnBOrp0XP2tAXpn9uu0",
  authDomain: "parking-system-managemen-277b5.firebaseapp.com",
  databaseURL: "https://parking-system-managemen-277b5-default-rtdb.firebaseio.com",
  projectId: "parking-system-managemen-277b5",
  storageBucket: "parking-system-managemen-277b5.appspot.com",
  messagingSenderId: "181875608379",
  appId: "1:181875608379:web:a259a855b8ab5ff934851e",
  measurementId: "G-1GH3FKY09N"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { database, ref, onValue };
