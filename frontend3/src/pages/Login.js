import React, { useState } from 'react';
import '../styles/Login.css';

const Login = ({ handleLogin, errorMessage }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        handleLogin(username, password);
    };

    return (
        <div className="container">
            <div className="login-box">
                <h1>Selamat Datang di Thunderbolt</h1>
                <p>Selamat datang di website Thunderbolt untuk menghitung proteksi petir bangunan Anda.</p>
                <p className="subheading">Masukkan username dan password untuk melanjutkan</p>
                <form onSubmit={handleSubmit}>
                    <div className="textbox">
                        <input 
                            type="text" 
                            placeholder="Username" 
                            value={username} 
                            onChange={(e) => setUsername(e.target.value)} 
                            required 
                        />
                    </div>
                    <div className="textbox">
                        <input 
                            type="password" 
                            placeholder="Password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            required 
                        />
                    </div>
                    <div className="checkbox">
                        <input 
                            type="checkbox" 
                            checked={rememberMe} 
                            onChange={() => setRememberMe(!rememberMe)} 
                        /> 
                        <label>Remember me</label>
                    </div>
                    <button type="submit">Login</button>
                    {errorMessage && <p className="error">{errorMessage}</p>}
                </form>
                <div className="signup">
                    <p>Belum punya akun? <a href="/signup">Daftar disini</a></p>
                </div>
            </div>
        </div>
    );
};

export default Login;
