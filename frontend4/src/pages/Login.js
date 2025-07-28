import React, { useState, useEffect } from 'react';
import '../styles/Login.css';

const Login = ({ handleLogin, errorMessage }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

useEffect(() => {
  document.body.style.backgroundImage = "url('/images/BG.png')";
  document.body.style.backgroundSize = "cover";
  document.body.style.backgroundPosition = "center";
  document.body.style.backgroundRepeat = "no-repeat";
  document.body.style.minHeight = "100vh";
  document.body.style.margin = "0";
  document.body.style.padding = "0";
  document.body.style.backgroundAttachment = "fixed";

  return () => {
    // reset ke gradasi default kalau keluar dari halaman login
    document.body.style.backgroundImage = '';
    document.body.style.backgroundSize = '';
    document.body.style.backgroundPosition = '';
    document.body.style.backgroundRepeat = '';
    document.body.style.minHeight = '';
    document.body.style.margin = '';
    document.body.style.padding = '';
    document.body.style.backgroundAttachment = '';
  };
}, []);


  const handleSubmit = (e) => {
    e.preventDefault();
    handleLogin(username, password);
  };

  return (
    <div className="container">
      <div className="login-box">
        <h1>Lightning Protection System For Buildings</h1>
        <h2>Create your Lightning Protection System and Simulate it!</h2>
        <p className="subheading">Login Page</p>
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
          <p>
            Don't have account? <a href="/signup">Create here!</a>
            <br />
            Thunderbolt App by Aimee Nicole
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
