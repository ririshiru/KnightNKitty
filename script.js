
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from "firebase/firestore";

// --- Firebase Configuration ---
// REPLACE THESE WITH YOUR ACTUAL FIREBASE KEYS
const firebaseConfig = {
    apiKey: "AIzaSyA4K_Ul35Z9U74T-0i6zyGkBccMVhX7za8",
    authDomain: "premium1-7af70.firebaseapp.com",
    projectId: "premium1-7af70",
    storageBucket: "premium1-7af70.firebasestorage.app",
    messagingSenderId: "625137091070",
    appId: "1:625137091070:web:29888d9b2ea50b733940af"
};


// Initialize Firebase
let db;
try {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
} catch (e) {
    console.warn("Firebase not initialized yet. Update config keys.", e);
}

document.addEventListener('DOMContentLoaded', () => {

    // --- Identity Management ---
    let currentUser = "Knight"; // Default
    const btnKnight = document.getElementById('btn-knight');
    const btnKitty = document.getElementById('btn-kitty');

    function setIdentity(identity) {
        currentUser = identity;
        if (identity === 'Knight') {
            btnKnight.classList.add('active');
            btnKitty.classList.remove('active');
        } else {
            btnKitty.classList.add('active');
            btnKnight.classList.remove('active');
        }
    }

    if (btnKnight && btnKitty) {
        btnKnight.addEventListener('click', () => setIdentity('Knight'));
        btnKitty.addEventListener('click', () => setIdentity('Kitty'));
        setIdentity('Knight'); // Set default visual state
    }

    // --- Placeholder Animation ---
    const inputField = document.getElementById('legacy-input');
    const prompts = [
        "Question: What is your vision??",
        "What are your expectations??",
        "Any secret message??"
    ];
    let promptIndex = 0;

    if (inputField) {
        setInterval(() => {
            promptIndex = (promptIndex + 1) % prompts.length;
            inputField.setAttribute('placeholder', prompts[promptIndex]);
        }, 3000);
    }

    // --- Chat Logic ---
    const feed = document.getElementById('legacy-feed');
    const sendBtn = document.getElementById('legacy-send');

    async function sendMessage() {
        if (!db) {
            alert("Firebase not configured. Please add keys in script.js");
            return;
        }

        const text = inputField.value.trim();
        if (!text) return;

        try {
            await addDoc(collection(db, "legacy_messages"), {
                user: currentUser,
                text: text,
                timestamp: serverTimestamp()
            });
            inputField.value = ""; // Clear input
        } catch (error) {
            console.error("Error sending message: ", error);
            alert("Failed to send. Check console.");
        }
    }

    if (sendBtn) {
        sendBtn.addEventListener('click', sendMessage);
    }

    // Real-time Listener
    if (db && feed) {
        // Sort by timestamp ascending (Oldest -> Newest)
        // With flex-direction: column and justify-content: flex-end,
        // Newest will be at the bottom (right above input box).
        const q = query(collection(db, "legacy_messages"), orderBy("timestamp", "asc"));
        onSnapshot(q, (snapshot) => {
            feed.innerHTML = ""; // Clear current feed

            snapshot.forEach((doc) => {
                const data = doc.data();
                const msgDiv = document.createElement('div');
                msgDiv.classList.add('message', data.user.toLowerCase()); // 'knight' or 'kitty'

                // Content
                const content = document.createElement('span');
                content.textContent = data.text;

                // Meta (Time)
                const meta = document.createElement('span');
                meta.classList.add('message-meta');
                if (data.timestamp) {
                    const date = data.timestamp.toDate();
                    meta.textContent = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                } else {
                    meta.textContent = "Sending...";
                }

                msgDiv.appendChild(content);
                msgDiv.appendChild(meta);

                // Prepend to show newest at bottom (if we flex-direction column-reverse) 
                // OR Append if we are standard. 
                // Logic says: "Sort by timestamp (newest on top)". 
                // If newest is ON TOP, we append because query is DESCending.
                feed.appendChild(msgDiv);
            });

            // If empty
            if (snapshot.empty) {
                feed.innerHTML = '<div class="loading-msg">No messages yet. Start the legacy.</div>';
            }
        }, (error) => {
            console.error("Error listening to changes: ", error);
            feed.innerHTML = '<div class="loading-msg">Connection Error. Check keys.</div>';
        });
    }


    // --- Scroll Animations (Intersection Observer) ---
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Only animate once
            }
        });
    }, observerOptions);

    // Elements to animate
    const animatedElements = document.querySelectorAll('.card, .timeline-item, .reason-item, .legacy-content');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        observer.observe(el);
    });

    // CSS class to trigger transition
    const style = document.createElement('style');
    style.innerHTML = `
        .visible {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
    `;
    document.head.appendChild(style);

    // --- Hero Animation (Canvas) ---
    const canvas = document.getElementById('hero-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        const frameCount = 80;
        const images = [];
        const imageBaseName = 'images/Shift_to_the_202602132007_xzqcu_';

        // Set canvas size
        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        // Preload images
        let imagesLoaded = 0;
        for (let i = 0; i < frameCount; i++) {
            const img = new Image();
            const paddedIndex = i.toString().padStart(3, '0');
            img.src = `${imageBaseName}${paddedIndex}.jpg`;
            img.onload = () => {
                imagesLoaded++;
                if (imagesLoaded === 1) { // Render first frame immediately
                    renderFrame(0);
                }
            };
            images.push(img);
        }

        // Animation Loop
        let currentFrame = 0;
        let lastTime = 0;
        const fps = 24;
        const interval = 1000 / fps;

        function renderFrame(index) {
            if (!images[index] || !images[index].complete) return;

            const img = images[index];

            // "Cover" fit logic
            const ratio = Math.max(canvas.width / img.width, canvas.height / img.height);
            const centerShift_x = (canvas.width - img.width * ratio) / 2;
            const centerShift_y = (canvas.height - img.height * ratio) / 2;

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, img.width, img.height,
                centerShift_x, centerShift_y, img.width * ratio, img.height * ratio);
        }

        function animate(timestamp) {
            if (timestamp - lastTime > interval) {
                renderFrame(currentFrame);
                currentFrame = (currentFrame + 1) % frameCount;
                lastTime = timestamp;
            }
            requestAnimationFrame(animate);
        }

        // Start animation once enough images are loaded
        const checkStart = setInterval(() => {
            if (imagesLoaded > 10) { // Start buffering after few frames
                clearInterval(checkStart);
                requestAnimationFrame(animate);
            }
        }, 100);
    }

    // --- Floating Hearts (Legacy & Vault) ---
    function initFloatingHearts() {
        // Targets: Legacy (gray) and Vault (white->red)
        const containers = [
            document.querySelector('.legacy-section'),
            document.getElementById('vault'),
            document.getElementById('legacy') // Just in case
        ];

        containers.forEach(container => {
            if (!container) return;

            // Ensure container is relative for absolute positioning of hearts
            if (getComputedStyle(container).position === 'static') {
                container.style.position = 'relative';
            }
            container.style.overflow = 'hidden'; // Keep hearts inside

            // Spawn hearts interval
            setInterval(() => {
                createHeart(container);
            }, 800);
        });

        function createHeart(container) {
            const heart = document.createElement('div');
            heart.classList.add('floating-heart');

            // Random Side (Left or Right)
            const isLeft = Math.random() > 0.5;
            const sideOffset = Math.random() * 5; // Closer to edge (0-5%)

            if (isLeft) {
                heart.style.left = `${sideOffset}%`;
            } else {
                heart.style.right = `${sideOffset}%`;
                heart.style.left = 'auto';
            }

            // Random Bottom Start
            heart.style.bottom = `${Math.random() * 20}%`;

            // Random Animation Duration
            const duration = 3 + Math.random() * 3; // 3-6s
            heart.style.animation = `floatUpSide ${duration}s ease-in-out forwards`;

            container.appendChild(heart);

            // Cleanup
            setTimeout(() => {
                heart.remove();
            }, duration * 1000);
        }
    }
    initFloatingHearts();


    // --- The Vault Logic ---
    const vaultInput = document.getElementById('vault-input');
    const vaultSubmit = document.getElementById('vault-submit');
    const vaultError = document.getElementById('vault-error');
    const vaultSection = document.getElementById('vault');
    const vaultReveal = document.getElementById('vault-reveal');
    const vaultContainer = document.querySelector('.vault-container');

    const CORRECT_PASSWORD = "4january2026"; // Hardcoded for demo simplicity

    function checkPassword() {
        const password = vaultInput.value;

        if (password === CORRECT_PASSWORD) {
            unlockVault();
        } else {
            showError("Incorrect password. Try again.");
        }
    }

    function unlockVault() {
        // Aesthetic changes
        vaultSection.classList.add('unlocked'); // Changes bg to Deep Red

        // Hide input container with fade
        vaultContainer.style.opacity = '0';
        setTimeout(() => {
            vaultContainer.style.display = 'none';
            // Show reveal content
            vaultReveal.classList.remove('hidden');
            // Small delay to allow display:block to apply before adding opacity class for transition
            requestAnimationFrame(() => {
                vaultReveal.classList.add('show');
            });
        }, 500);
    }

    function showError(msg) {
        vaultError.textContent = msg;
        vaultInput.classList.add('shake');
        setTimeout(() => {
            vaultInput.classList.remove('shake');
        }, 500);
    }

    // Add shake animation
    const shakeStyle = document.createElement('style');
    shakeStyle.innerHTML = `
        .shake {
            animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
        }
        @keyframes shake {
            10%, 90% { transform: translate3d(-1px, 0, 0); }
            20%, 80% { transform: translate3d(2px, 0, 0); }
            30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
            40%, 60% { transform: translate3d(4px, 0, 0); }
        }
    `;
    document.head.appendChild(shakeStyle);

    if (vaultSubmit) {
        // Event Listeners
        vaultSubmit.addEventListener('click', checkPassword);
        vaultInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                checkPassword();
            }
        });
    }

});
