document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();  // Mencegah form submit default

    const formData = new FormData(this);
    const credentials = {
        username: formData.get('username'),
        password: formData.get('password')
    };

    fetch('/login/', {  // URL login yang benar
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',  // Mengirim data dalam format JSON
            'X-CSRFToken': document.cookie.match(/csrftoken=([\w-]+)/)[1],  // Mengambil CSRF token dari cookie
        },
        body: JSON.stringify(credentials),  // Mengirim data sebagai JSON
    })
    .then(response => {
        if (response.ok) {
            return response.json();  // Parsing JSON dari response jika sukses
        }
        throw new Error('Login gagal');  // Menangani jika response tidak sukses
    })
    .then(data => {
        if (data.message === 'Login berhasil') {
            window.location.href = '/home';  // Redirect setelah login sukses
        } else {
            alert(data.error || 'Login gagal');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Terjadi kesalahan saat login.');
    });
});
