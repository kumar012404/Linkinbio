import { db } from './firebase-config.js';
import { doc, onSnapshot } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";

const loader = document.getElementById('loader');
const profileNotFound = document.getElementById('profile-not-found');
const profileViewer = document.getElementById('profile-viewer');

const displayImg = document.getElementById('display-img');
const displayUsername = document.getElementById('display-username');

// Links
const cardInsta = document.getElementById('card-insta');
const cardYoutube = document.getElementById('card-youtube');
const cardWhatsapp = document.getElementById('card-whatsapp');
const shareBtn = document.getElementById('share-btn');
const shareBtnWrapper = document.getElementById('share-btn-wrapper');
const shareTooltip = document.getElementById('share-tooltip');

function handleShare() {
    const url = window.location.href;
    const title = document.title;
    
    if (navigator.share) {
        navigator.share({
            title: title,
            url: url
        }).catch(err => console.log('Share failed:', err));
    } else {
        // Fallback: Copy to clipboard
        navigator.clipboard.writeText(url).then(() => {
            shareTooltip.classList.add('show');
            setTimeout(() => shareTooltip.classList.remove('show'), 2000);
        });
    }
}

if (shareBtn) {
    shareBtn.addEventListener('click', handleShare);
}

function getInstagramDeepLink(inputUrl) {
    try {
        const url = new URL(inputUrl.startsWith('http') ? inputUrl : `https://${inputUrl}`);
        if (url.hostname.includes('instagram.com')) {
            const parts = url.pathname.split('/').filter(p => p !== '');
            if (parts.length > 0) {
                const username = parts[0];
                return `instagram://user?username=${username}`;
            }
        }
    } catch (e) {}
    return inputUrl;
}

function loadProfile() {
    // Get username from URL (/profile.html?u=username or handle path if hosted)
    const urlParams = new URLSearchParams(window.location.search);
    let username = urlParams.get('u');

    if (!username) {
        const path = window.location.pathname.split('/').pop();
        if (path && path !== 'profile.html' && path !== 'index.html' && path !== '') {
            username = path;
        }
    }

    if (!username) {
        showNotFound();
        return;
    }

    // Real-time listener
    const docRef = doc(db, "users", username.toLowerCase());
    onSnapshot(docRef, (docSnap) => {
        loader.classList.add('hidden');
        if (docSnap.exists()) {
            const data = docSnap.data();
            renderProfile(username, data);
            profileNotFound.classList.add('hidden');
        } else {
            showNotFound();
        }
    }, (error) => {
        console.error("Error fetching profile:", error);
        showNotFound();
    });
}

function renderProfile(username, data) {
    if (displayUsername) {
        displayUsername.innerText = `@${username}`;
    }
    
    // Reset visibility
    const links = [cardInsta, cardYoutube, cardWhatsapp];
    links.forEach(link => link.classList.add('hidden'));

    if (data.profileImg) {
        displayImg.src = data.profileImg;
    } else {
        displayImg.src = "https://via.placeholder.com/150";
    }

    // Instagram Deep Link Handling
    if (data.instagram) {
        let finalUrl = data.instagram;
        try {
            const url = new URL(data.instagram.startsWith('http') ? data.instagram : `https://${data.instagram}`);
            const username = url.pathname.split('/').filter(p => p !== '').shift();
            
            // Check if it looks like a profile username (not a post or reel)
            const ignore = ['reels', 'p', 'stories', 'explore'];
            if (username && !ignore.includes(username)) {
                // The '/_u/' trick is the most reliable way to force the App on mobile
                finalUrl = `https://www.instagram.com/_u/${username}/`;
            }
        } catch (e) {
            console.error("Error formatting Instagram link:", e);
        }

        cardInsta.href = finalUrl;
        cardInsta.classList.remove('hidden');
        
        // IMPORTANT: target="_blank" often forces the browser. 
        // Removing it for Instagram can help the OS trigger the app.
        if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
            cardInsta.removeAttribute('target');
        }
    }

    // YouTube
    if (data.youtube) {
        cardYoutube.href = data.youtube;
        cardYoutube.classList.remove('hidden');
    }

    // WhatsApp
    if (data.whatsapp) {
        cardWhatsapp.href = data.whatsapp;
        cardWhatsapp.classList.remove('hidden');
    }

    if (shareBtnWrapper) shareBtnWrapper.classList.remove('hidden');
    profileViewer.classList.remove('hidden');
}

function showNotFound() {
    profileNotFound.classList.remove('hidden');
    loader.classList.add('hidden');
}

// Start loading
loadProfile();
