import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { loginUser, signupUser, logoutUser, refreshAccessToken } from './api'; // Import from api.js
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import SignUp from './pages/Signup';
import './App.css'; // Import your CSS styles

const App = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    // Check token when the page loads and set login state accordingly
    useEffect(() => {
        const token = localStorage.getItem('access');
        if (token) {
            setIsLoggedIn(true);  // If token exists, set logged in to true
        } else {
            setIsLoggedIn(false); // If no token, set logged in to false
        }
        setLoading(false);  // Done checking the token
    }, []); 

    const handleLogin = async (username, password) => {
        setErrorMessage(''); // Clear previous error message before attempting login
        const response = await loginUser({ username, password }); // Use the loginUser function from api.js

        if (response) {
            setIsLoggedIn(true);  // If login is successful
            navigate("/dashboard"); // Navigate to dashboard
        } else {
            setErrorMessage('Invalid username or password');
        }
    };

    const handleLogout = async () => {
        await logoutUser(); // Use the logoutUser function from api.js
        setIsLoggedIn(false);  // Set logout status
        navigate("/login");  // Navigate to login page
    };

    const handleSignUp = async (username, password) => {
        setErrorMessage(''); // Clear previous error message before attempting signup
        const response = await signupUser({ username, password }); // Use the signupUser function from api.js
        if (response) {
            handleLogin(username, password); // After successful signup, login automatically
        } else {
            setErrorMessage('Signup failed. Please try again');
        }
    };

    // Function to check expired token and refresh it
    const checkTokenExpiry = async () => {
        const accessToken = localStorage.getItem('access');
        const refreshToken = localStorage.getItem('refresh');
        
        if (!accessToken && refreshToken) {
            const newAccessToken = await refreshAccessToken(refreshToken);
            if (newAccessToken) {
                localStorage.setItem('access', newAccessToken);
                setIsLoggedIn(true); // Set login status to true
            }
        }
    };

    useEffect(() => {
        checkTokenExpiry();
    }, []);

    if (loading) return <div className="loading">Loading...</div>; // Show loading initially

    return (
        <div className="container">
            <Routes>
                <Route path="/" element={<Navigate to="/login" />} />  {/* Redirect to login */}
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
            </Routes>
        </div>
    );
};

export default App;
