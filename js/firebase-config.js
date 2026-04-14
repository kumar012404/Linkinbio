// Firebase v9+ Modular Configuration
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";

// Your web app's Firebase configuration
// Replace with your actual config
const firebaseConfig = {
    apiKey: "AIzaSyD3GhAe5lmgv69wOGeHGBOwceVH7xG0Ung",
    authDomain: "linkinbio-38c17.firebaseapp.com",
    projectId: "linkinbio-38c17",
    storageBucket: "linkinbio-38c17.firebasestorage.app",
    messagingSenderId: "698956658410",
    appId: "1:698956658410:web:a85ff0a0b72a43a243c993"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
