// Firebase Configuration (Directly Added)
const firebaseConfig = {
  apiKey: "AIzaSyCXeBxPtMSCuNyoctZ61g7eUNZgG0FyISE",
  authDomain: "shgesports-15815.firebaseapp.com",
  projectId: "shgesports-15815",
  storageBucket: "shgesports-15815.firebasestorage.app",
  messagingSenderId: "899657492968",
  appId: "1:899657492968:web:5f9a897f47ea97e1c35c5d",
  measurementId: "G-NTG8VCBYLM"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

let isLoginMode = true;

// 1. Auth Logic (Login/Logout)
auth.onAuthStateChanged(user => {
    if (user) {
        document.getElementById('authOverlay').classList.add('hidden');
        document.getElementById('walletBox').classList.remove('hidden');
        document.getElementById('userIcon').classList.remove('hidden');
        loadUserData(user.uid);
        loadMatches();
    } else {
        document.getElementById('authOverlay').classList.remove('hidden');
        document.getElementById('walletBox').classList.add('hidden');
        document.getElementById('userIcon').classList.add('hidden');
    }
});

async function handleAuth() {
    const email = document.getElementById('authEmail').value;
    const pass = document.getElementById('authPass').value;

    if(!email || !pass) return alert("Email & Password din!");

    try {
        if (isLoginMode) {
            await auth.signInWithEmailAndPassword(email, pass);
        } else {
            const res = await auth.createUserWithEmailAndPassword(email, pass);
            // New user entry in DB
            await db.collection("users").doc(res.user.uid).set({
                email: email,
                balance: 0,
                role: "player"
            });
        }
    } catch (err) {
        alert(err.message);
    }
}

function handleLogout() {
    auth.signOut().then(() => window.location.reload());
}

function toggleAuthMode() {
    isLoginMode = !isLoginMode;
    document.getElementById('authTitle').innerText = isLoginMode ? "LOGIN" : "REGISTER";
    document.getElementById('authBtn').innerText = isLoginMode ? "LOGIN NOW" : "REGISTER NOW";
    document.getElementById('toggleText').innerText = isLoginMode ? "Don't have an account? Register" : "Already have an account? Login";
}

// 2. Load User & Match Data
async function loadUserData(uid) {
    db.collection("users").doc(uid).onSnapshot(doc => {
        const data = doc.data();
        document.getElementById('userBalance').innerText = data.balance;
        document.getElementById('pName').innerText = data.email.split('@')[0];
        document.getElementById('pEmail').innerText = data.email;
        
        if (data.role === "admin") {
            document.getElementById('adminBtn').classList.remove('hidden');
        }
    });
}

function loadMatches() {
    db.collection("matches").onSnapshot(snapshot => {
        const container = document.getElementById('matchContainer');
        container.innerHTML = "";
        
        snapshot.forEach(doc => {
            const m = doc.data();
            const id = doc.id;
            const now = new Date().getTime();
            const startTime = new Date(m.startTime).getTime();

            // Auto Delete
            if (now >= startTime) {
                db.collection("matches").doc(id).delete();
                return;
            }

            const joined = m.players && m.players.includes(auth.currentUser.uid);

            container.innerHTML += `
                <div class="match-card">
                    <div class="m-header"><span>${m.map}</span> <b>${m.type}</b></div>
                    <div class="m-body">
                        <p><i class="far fa-clock"></i> ${m.startTime}</p>
                        <p>Win: ৳${m.prize} | Entry: ৳${m.entryFee}</p>
                    </div>
                    ${joined ? `
                        <div class="room-box">ID: ${m.roomId} | PW: ${m.roomPass}</div>
                        <button class="main-btn joined" disabled>ALREADY JOINED</button>
                    ` : `
                        <button class="main-btn" onclick="joinMatch('${id}', ${m.entryFee})">JOIN NOW</button>
                    `}
                </div>
            `;
        });
    });
}

// 3. Join Match Logic
async function joinMatch(mId, fee) {
    const userRef = db.collection("users").doc(auth.currentUser.uid);
    const userDoc = await userRef.get();
    
    if(userDoc.data().balance < fee) return alert("Low Balance!");

    await db.collection("matches").doc(mId).update({
        players: firebase.firestore.FieldValue.arrayUnion(auth.currentUser.uid)
    });
    await userRef.update({ balance: userDoc.data().balance - fee });
    alert("Joined Success!");
}

// Tabs & Modals
function switchSection(id) {
    document.querySelectorAll('.content-section').forEach(s => s.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
    document.querySelectorAll('.t-btn').forEach(b => b.classList.remove('active'));
    event.currentTarget.classList.add('active');
}

function toggleModal(id) {
    const m = document.getElementById(id);
    m.style.display = (m.style.display === "block") ? "none" : "block";
}
