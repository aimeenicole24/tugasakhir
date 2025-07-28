import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signupUser } from '../api'; // Mengimpor fungsi signupUser dari api.js
import '../styles/Signup.css'; // Mengimpor file CSS terpisah untuk Signup

const Signup = ({ setSignUp }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const navigate = useNavigate();

    const handleSignup = async (e) => {
        e.preventDefault();

        if (!username.trim() || !password.trim()) {
            setError('Username dan password tidak boleh kosong');
            return;
        }

        setError('');
        try {
            const response = await signupUser({ username, password }); // Menggunakan fungsi signupUser dari api.js

            if (response) {
                setSuccessMessage('Signup berhasil!');
                setSignUp(username, password);  // Login otomatis setelah signup
                navigate('/dashboard');
            }
        } catch (error) {
            setError(error.response?.data?.error || 'Signup gagal. Coba lagi.');
        }
    };

    return (
        <div className="signup-container">
            <div className="signup-box">
                <h2 className="title">Sign Up</h2>
                {error && <p className="error">{error}</p>}
                {successMessage && <p className="success">{successMessage}</p>}

                <form onSubmit={handleSignup} className="form">
                    <div className="input-container">
                        <input
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="input"
                        />
                    </div>
                    <div className="input-container">
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="input"
                        />
                    </div>
                    <button type="submit" className="button">
                        Sign Up
                    </button>
                </form>

                <p className="login-link">
                    Sudah punya akun? <a href="/login" className="link">Login disini</a>
                </p>
            </div>
        </div>
    );
};

export default Signup;
