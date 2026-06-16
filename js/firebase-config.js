// Firebase v9+ Modular Configuration
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithCredential, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDvvpOah3PcjalEzFBXkjo49OTLbnZPYLA",
    authDomain: "business-ai-125fd.firebaseapp.com",
    projectId: "business-ai-125fd",
    storageBucket: "business-ai-125fd.firebasestorage.app",
    messagingSenderId: "779268228075",
    appId: "1:779268228075:web:9d330ab37f17f6124e8fae"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Check if google_credential is in localStorage and automatically sign in
const googleCred = localStorage.getItem('google_credential');
if (googleCred) {
    onAuthStateChanged(auth, (user) => {
        if (!user) {
            const credential = GoogleAuthProvider.credential(googleCred);
            signInWithCredential(auth, credential).then((result) => {
                console.log("Auto-login via Google Credential successful:", result.user.email);
            }).catch((err) => {
                console.error("Auto-login via Google Credential failed:", err);
            });
        } else {
            // Already logged in
            if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('LinkinBio/')) {
                window.location.href = 'dashboard.html';
            }
        }
    });
} else {
    // If not using Google Login, still handle redirect if session already exists
    onAuthStateChanged(auth, (user) => {
        if (user && (window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('LinkinBio/'))) {
            window.location.href = 'dashboard.html';
        }
    });
}

export { auth, db };
