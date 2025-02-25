import { getDatabase, ref, set } from "firebase/database";
import { initializeApp } from "firebase/app";

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

function testFirebase() {
    set(ref(database, 'test/'), {
        message: "Firebase Connected!"
    })
    .then(() => {
        console.log("✅ Success: Firebase is working!");
    })
    .catch((error) => {
        console.error("❌ Error:", error);
    });
}

testFirebase();
