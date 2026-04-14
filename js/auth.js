import { auth } from './firebase-config.js';
import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/12.12.0/firebase-auth.js";

const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const authToggle = document.getElementById('auth-toggle');
const formTitle = document.getElementById('form-title');
const switchText = document.getElementById('switch-text');
const authError = document.getElementById('auth-error');

// Toggle between Login and Signup
authToggle.addEventListener('click', (e) => {
    e.preventDefault();
    loginForm.classList.toggle('hidden');
    signupForm.classList.toggle('hidden');
    
    if (loginForm.classList.contains('hidden')) {
        formTitle.innerText = 'Create Account';
        authToggle.innerText = 'Login';
        switchText.innerText = 'Already have an account?';
    } else {
        formTitle.innerText = 'Login';
        authToggle.innerText = 'Sign Up';
        switchText.innerText = "Don't have an account?";
    }
    authError.innerText = '';
});

// Handle Signup
signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;

    try {
        await createUserWithEmailAndPassword(auth, email, password);
        window.location.href = 'dashboard.html';
    } catch (error) {
        authError.innerText = error.message;
    }
});

// Handle Login
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        await signInWithEmailAndPassword(auth, email, password);
        window.location.href = 'dashboard.html';
    } catch (error) {
        authError.innerText = "Invalid credentials. Please try again.";
    }
});

// Check if already logged in
onAuthStateChanged(auth, (user) => {
    if (user && window.location.pathname.endsWith('index.html') || window.location.pathname === '/' ) {
        // window.location.href = 'dashboard.html';
    }
});
