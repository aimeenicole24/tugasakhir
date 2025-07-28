import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../api'; // Mengimpor fungsi loginUser dari api.js
import '../styles/Login.css';  // Mengimpor CSS terpisah

const Login = ({ setIsLoggedIn }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const navigate = useNavigate();

    // Mengecek token saat halaman login dimuat
    useEffect(() => {
        const token = localStorage.getItem('access');
        if (token) {
            navigate('/dashboard');  // Jika token ada, langsung ke dashboard
        }
    }, [navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();

        if (!username.trim() || !password.trim()) {
            setError('Username dan password tidak boleh kosong');
            return;
        }

        setLoading(true);
        setError('');
        setSuccessMessage('');

        try {
            const response = await loginUser({ username, password }); // Menggunakan fungsi loginUser dari api.js

            if (response) {
                const { access, refresh } = response;
                localStorage.setItem('access', access); // Simpan token setelah login berhasil
                localStorage.setItem('refresh', refresh);
                setIsLoggedIn(true);  // Set login berhasil
                setSuccessMessage('Login berhasil!');
                navigate('/dashboard'); // Arahkan ke dashboard setelah login berhasil
            }
        } catch (error) {
            if (error.response) {
                setError(error.response?.data?.detail || 'Login gagal. Periksa username dan password.');
            } else {
                setError('Terjadi kesalahan jaringan atau server tidak tersedia.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <h2 className="title">Selamat Datang di Aplikasi</h2>
                {error && <p className="error">{error}</p>}
                {successMessage && <p className="success">{successMessage}</p>}

                <form onSubmit={handleLogin} className="form">
                    <div className="input-container">
                        <input
                            type="text"
                            id="username"
                            name="username"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="input"
                        />
                    </div>
                    <div className="input-container">
                        <input
                            type="password"
                            id="password"
                            name="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="input"
                        />
                    </div>
                    <button
                        type="submit"
                        className="button"
                        disabled={loading}
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                <p className="signup-link">
                    Belum punya akun? <a href="/signup" className="link">Daftar Sekarang</a>
                </p>
            </div>
        </div>
    );
};

export default Login;
