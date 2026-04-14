import { auth, db } from './firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-auth.js";
import { 
    doc, 
    getDoc, 
    setDoc, 
    collection, 
    query, 
    where, 
    getDocs 
} from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";

const dashboardForm = document.getElementById('dashboard-form');
const logoutBtn = document.getElementById('logout-btn');
const usernameInput = document.getElementById('username');
const urlPreview = document.getElementById('url-preview');
const loader = document.getElementById('loader');
const mainContent = document.getElementById('main-content');
const statusMsg = document.getElementById('status-msg');
const viewProfileDiv = document.getElementById('view-profile-div');
const viewProfileBtn = document.getElementById('view-profile-btn');
const editUsernameBtn = document.getElementById('edit-username-btn');

let currentUser = null;
let currentProfileData = null;

// Protect Route
onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.href = 'index.html';
    } else {
        currentUser = user;
        await loadUserData();
        // Show content after everything is loaded
        mainContent.classList.remove('hidden');
        loader.classList.add('hidden');
    }
});

// Load existing data
async function loadUserData() {
    try {
        const q = query(collection(db, "users"), where("owner", "==", currentUser.uid));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
            const docSnap = querySnapshot.docs[0];
            const data = docSnap.data();
            currentProfileData = data;
            
            usernameInput.value = docSnap.id;
            usernameInput.disabled = true;
            editUsernameBtn.classList.remove('hidden');
            urlPreview.innerText = docSnap.id;
            
            document.getElementById('profile-img').value = data.profileImg || '';
            document.getElementById('instagram-link').value = data.instagram || '';
            document.getElementById('youtube-link').value = data.youtube || '';
            document.getElementById('whatsapp-link').value = data.whatsapp || '';
            
            showViewButton(docSnap.id);
        }
    } catch (error) {
        console.error("Error loading user data:", error);
    }
}

// Update URL preview as typing
usernameInput.addEventListener('input', (e) => {
    urlPreview.innerText = e.target.value || 'username';
});

// Save/Update Profile
dashboardForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = usernameInput.value.trim().toLowerCase();
    
    if (!username) return;

    loader.classList.remove('hidden');
    statusMsg.innerText = "Saving...";

    const profileData = {
        owner: currentUser.uid,
        profileImg: document.getElementById('profile-img').value,
        instagram: document.getElementById('instagram-link').value,
        youtube: document.getElementById('youtube-link').value,
        whatsapp: document.getElementById('whatsapp-link').value,
        updatedAt: new Date().toISOString()
    };

    try {
        // If it's a new username, check if it exists
        if (!currentProfileData) {
            const docRef = doc(db, "users", username);
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists()) {
                statusMsg.innerText = "Error: Username already taken!";
                loader.classList.add('hidden');
                return;
            }
        }

        // Save to Firestore
        await setDoc(doc(db, "users", username), profileData);
        statusMsg.innerText = "✅ Profile updated successfully!";
        usernameInput.disabled = true;
        editUsernameBtn.classList.remove('hidden');
        showViewButton(username);
        
    } catch (error) {
        statusMsg.innerText = "Error saving profile: " + error.message;
    }
    loader.classList.add('hidden');
});

function showViewButton(username) {
    viewProfileDiv.style.display = 'block';
    viewProfileBtn.href = `profile.html?u=${username}`;
}

// Allow editing username
editUsernameBtn.addEventListener('click', () => {
    usernameInput.disabled = false;
    usernameInput.focus();
    editUsernameBtn.classList.add('hidden');
    currentProfileData = null; // treat as new so it checks for duplicate
    statusMsg.innerText = 'Username unlocked. Choose a new unique username.';
});

// Logout
logoutBtn.addEventListener('click', () => {
    signOut(auth).then(() => {
        window.location.href = 'index.html';
    });
});
