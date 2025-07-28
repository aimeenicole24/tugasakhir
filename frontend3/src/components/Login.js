import React, { useState } from 'react';

const LoginComponent = () => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
  });

  // Mengambil CSRF token dari cookie
  const csrfToken = document.cookie.match(/csrftoken=([\w-]+)/)[1];

  // Fungsi untuk menangani submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://127.0.0.1:8000/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken,  // Pastikan token CSRF dikirim
        },
        body: JSON.stringify(credentials),
        credentials: 'include',  // Untuk mengirim cookies bersama request
      });

      const data = await response.json();
      if (data.success) {
        // Lakukan sesuatu jika login berhasil
        console.log('Login successful!');
      } else {
        // Tangani error jika login gagal
        console.log('Login failed');
      }
    } catch (error) {
      console.error('Error during login:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Username:
        <input
          type="text"
          value={credentials.username}
          onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
        />
      </label>
      <label>
        Password:
        <input
          type="password"
          value={credentials.password}
          onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
        />
      </label>
      <button type="submit">Login</button>
    </form>
  );
};

export default LoginComponent;
