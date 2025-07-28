import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { loginUser, signupUser, logoutUser, refreshAccessToken } from './api'; // Import from api.js
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import SignUp from './pages/Signup';
import BuildingForm from './pages/BuildingForm';  // Import BuildingForm
import './App.css'; // Import your CSS styles

const App = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('access');
        if (token) {
            setIsLoggedIn(true);
        } else {
            setIsLoggedIn(false);
        }
        setLoading(false);
    }, []);

    const handleLogin = async (username, password) => {
        setErrorMessage('');
        const response = await loginUser({ username, password });

        if (response) {
            setIsLoggedIn(true);
            navigate("/dashboard");
        } else {
            setErrorMessage('Invalid username or password');
        }
    };

    const handleLogout = async () => {
        await logoutUser();
        setIsLoggedIn(false);
        navigate("/login");
    };

    const handleSignUp = async (username, password) => {
        setErrorMessage('');
        const response = await signupUser({ username, password });
        if (response) {
            handleLogin(username, password);
        } else {
            setErrorMessage('Signup failed. Please try again');
        }
    };

    const checkTokenExpiry = async () => {
        const accessToken = localStorage.getItem('access');
        const refreshToken = localStorage.getItem('refresh');
        
        if (!accessToken && refreshToken) {
            const newAccessToken = await refreshAccessToken(refreshToken);
            if (newAccessToken) {
                localStorage.setItem('access', newAccessToken);
                setIsLoggedIn(true);
            }
        }
    };

    useEffect(() => {
        checkTokenExpiry();
    }, []);

    if (loading) return <div className="loading">Loading...</div>;

    return (
        <div className="container">
            <Routes>
                <Route path="/" element={<Navigate to="/login" />} />
                <Route
                    path="/login"
                    element={<Login handleLogin={handleLogin} errorMessage={errorMessage} />}
                />
                <Route
                    path="/signup"
                    element={<SignUp handleSignUp={handleSignUp} errorMessage={errorMessage} />}
                />
                <Route
                    path="/dashboard"
                    element={isLoggedIn ? <Dashboard handleLogout={handleLogout} /> : <Navigate to="/login" />}
                />
                <Route
                    path="/new-input"
                    element={isLoggedIn ? <BuildingForm /> : <Navigate to="/login" />} // Add new route for BuildingForm
                />
            </Routes>
        </div>
    );
};

export default App;
