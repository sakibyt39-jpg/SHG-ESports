import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, push, set } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// Your provided Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyCXeBxPtMSCuNyoctZ61g7eUNZgG0FyISE",
  authDomain: "shgesports-15815.firebaseapp.com",
  projectId: "shgesports-15815",
  storageBucket: "shgesports-15815.firebasestorage.app",
  messagingSenderId: "899657492968",
  appId: "1:899657492968:web:5f9a897f47ea97e1c35c5d",
  measurementId: "G-NTG8VC BYLM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

let currentProduct = "";

// Modal Functions
window.openModal = function(productName) {
    currentProduct = productName;
    document.getElementById('productTitle').innerText = productName;
    document.getElementById('orderModal').style.display = 'block';
    document.getElementById('overlay').style.display = 'block';
}

window.closeModal = function() {
    document.getElementById('orderModal').style.display = 'none';
    document.getElementById('overlay').style.display = 'none';
}

// Order Submission Logic
document.getElementById('topupForm').addEventListener('submit', (e) => {
    e.preventDefault();

    const orderDetails = {
        game: currentProduct,
        playerID: document.getElementById('playerID').value,
        phone: document.getElementById('userPhone').value,
        method: document.getElementById('payMethod').value,
        transactionID: document.getElementById('trxID').value,
        status: "Pending",
        date: new Date().toLocaleString()
    };

    // Firebase Database-e pathano
    const ordersRef = ref(db, 'orders');
    const newOrderRef = push(ordersRef);

    set(newOrderRef, orderDetails)
        .then(() => {
            alert("Order Submitted! Please wait for SHG ESPORTS to process.");
            document.getElementById('topupForm').reset();
            closeModal();
        })
        .catch((error) => {
            alert("Error: " + error.message);
        });
});
