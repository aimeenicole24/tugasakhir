import React, { useState } from 'react';
import bgImage from '../../assets/images/BG.png';
console.log('Path gambar:', bgImage);

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
    <div
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          backgroundColor: 'rgba(0,0,0,0.6)',
          padding: '40px',
          borderRadius: '12px',
          color: 'white'
        }}
      >
        <label>
          Username:
          <input
            type="text"
            value={credentials.username}
            onChange={(e) =>
              setCredentials({ ...credentials, username: e.target.value })
            }
          />
        </label>
        <br />
        <label>
          Password:
          <input
            type="password"
            value={credentials.password}
            onChange={(e) =>
              setCredentials({ ...credentials, password: e.target.value })
            }
          />
        </label>
        <br />
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default LoginComponent;
