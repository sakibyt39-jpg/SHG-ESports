// Firebase Config
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_ID",
  appId: "YOUR_APP_ID"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Demo User ID (Tumi auth use korle real ID pabe)
const USER_ID = "nikboy_user_1"; 

// 1. Fetch Matches & Handle Logic
function initApp() {
    db.collection("matches").onSnapshot((snapshot) => {
        const container = document.getElementById("matchContainer");
        container.innerHTML = "";
        const now = new Date().getTime();

        snapshot.forEach((doc) => {
            const m = doc.data();
            const id = doc.id;
            const startTime = new Date(m.startTime).getTime();

            // Auto-Delete Logic: Time shesh hole dilit
            if (now >= startTime) {
                db.collection("matches").doc(id).delete();
                return;
            }

            const isJoined = m.players && m.players.includes(USER_ID);

            container.innerHTML += `
                <div class="match-card">
                    <div class="m-top">
                        <span class="m-map">${m.map}</span>
                        <span class="m-type">${m.type}</span>
                    </div>
                    <div class="m-info">
                        <p><i class="fas fa-clock"></i> ${m.startTime}</p>
                        <p>Win Prize: ৳${m.prize} | Entry: ৳${m.entryFee}</p>
                    </div>
                    ${isJoined ? `
                        <div class="room-info">
                            <p><b>Room ID:</b> ${m.roomId || 'Waiting...'}</p>
                            <p><b>Pass:</b> ${m.roomPass || 'Waiting...'}</p>
                        </div>
                        <button class="join-btn joined" disabled>JOINED</button>
                    ` : `
                        <button class="join-btn" onclick="processJoin('${id}', ${m.entryFee})">JOIN MATCH</button>
                    `}
                </div>
            `;
        });
    });

    // User Profile & Admin Check
    db.collection("users").doc(USER_ID).onSnapshot(doc => {
        const data = doc.data();
        document.getElementById('userBalance').innerText = data.balance;
        
        // Agar user admin hoy, tobe admin button dekhabe
        if (data.role === "admin") {
            document.getElementById('adminBtn').classList.remove('hidden');
        }
    });
}

// 2. Join Logic
async function processJoin(mId, fee) {
    const userRef = db.collection("users").doc(USER_ID);
    const userDoc = await userRef.get();
    
    if (userDoc.data().balance < fee) {
        alert("Pokaṭe taka nai! Agey Add Money koro.");
        return;
    }

    // Ekbar join korle ar parbe na (Firebase arrayUnion automatically handle kore)
    await db.collection("matches").doc(mId).update({
        players: firebase.firestore.FieldValue.arrayUnion(USER_ID)
    });

    await userRef.update({
        balance: userDoc.data().balance - fee
    });

    alert("Match Join Success!");
}

// 3. Tab Switching
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

window.onload = initApp;
