// websocket.js

// Membuat koneksi WebSocket ke server
const socket = new WebSocket('ws://localhost:3000/ws');  // Sesuaikan dengan URL server WebSocket Anda

// Ketika koneksi berhasil dibuka
socket.onopen = () => {
    console.log("WebSocket connection established!");
};

// Ketika ada error dalam koneksi WebSocket
socket.onerror = (error) => {
    console.error("WebSocket Error: ", error);
};

// Ketika menerima pesan dari server
socket.onmessage = (event) => {
    console.log("WebSocket message received: ", event.data);
};

// Ketika koneksi ditutup
socket.onclose = (event) => {
    console.log("WebSocket connection closed: ", event);
};

// Fungsi untuk mengirimkan pesan ke server WebSocket
function sendMessage(message) {
    if (socket.readyState === WebSocket.OPEN) {
        socket.send(message);
    } else {
        console.log("WebSocket is not connected yet.");
    }
}
