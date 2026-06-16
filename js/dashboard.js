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
const generateQrBtn = document.getElementById('generate-qr-btn');
const qrModal = document.getElementById('qr-modal');
const qrContainer = document.getElementById('qrcode');
const qrClose = document.getElementById('close-qr');
const qrUrlText = document.getElementById('qr-url');

let currentUser = null;
let currentProfileData = null;

// Protect Route
onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.href = 'index.html';
    } else {
        currentUser = user;
        
        const headerUserEmail = document.getElementById('header-user-email');
        if (headerUserEmail && user.email) {
            const displayEmail = user.email.split('@')[0];
            headerUserEmail.innerHTML = `<i class="fas fa-user-circle"></i> ${displayEmail}`;
        }

        await loadUserData();
        // Show content after everything is loaded
        mainContent.classList.remove('hidden');
        loader.classList.add('hidden');
    }
});

// Load existing data
async function loadUserData() {
    try {
        const q = query(collection(db, "projects", "linkinbio", "users"), where("owner", "==", currentUser.uid));
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
            const docRef = doc(db, "projects", "linkinbio", "users", username);
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists() && docSnap.data().owner !== currentUser.uid) {
                statusMsg.innerText = "Error: Username already taken!";
                loader.classList.add('hidden');
                return;
            }
        }

        // Save to Firestore
        await setDoc(doc(db, "projects", "linkinbio", "users", username), profileData);
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
    viewProfileDiv.style.display = 'flex';
    viewProfileBtn.href = `profile.html?u=${username}`;
}

// Generate QR Code
generateQrBtn.addEventListener('click', () => {
    const username = usernameInput.value.trim().toLowerCase();
    if (!username) return;

    // Clear previous QR
    qrContainer.innerHTML = '';
    
    // Construct the absolute URL (Works for local and hosted)
    const baseUrl = window.location.origin + window.location.pathname.replace('dashboard.html', '');
    const publicUrl = `${baseUrl}${username}`;
    
    qrUrlText.innerText = publicUrl;

    // Generate QR
    new QRCode(qrContainer, {
        text: publicUrl,
        width: 180,
        height: 180,
        colorDark : "#000000",
        colorLight : "#ffffff",
        correctLevel : QRCode.CorrectLevel.H
    });

    qrModal.style.display = 'flex';
});

// Close QR Modal
qrClose.addEventListener('click', () => {
    qrModal.style.display = 'none';
});

// Close on click outside
window.addEventListener('click', (e) => {
    if (e.target === qrModal) {
        qrModal.style.display = 'none';
    }
});

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
