// src/components/Sidebar.js
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <div
      className="sidebar"
      style={{
        width: '300px',
        padding: '30px 25px',
        backgroundColor: '#1e1e2f',
        height: '100vh',
        color: 'white',
        fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
      }}
    >
      <h2
        style={{
          marginBottom: '40px',
          fontWeight: 'bold',
          fontSize: '28px',
          letterSpacing: '1.5px',
          userSelect: 'none',
        }}
      >
        THUNDERBOLT
      </h2>
      <nav>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          <li style={{ marginBottom: '28px' }}>
            <SidebarLink to="/dashboard" active={isActive('/dashboard')}>
              <i
                className="fa fa-tachometer-alt rotating-icon"
                style={{ marginRight: '14px', width: '22px', textAlign: 'center', flexShrink: 0 }}
              />
              <span style={{ flex: 1, textAlign: 'left' }}>Dashboard</span>
            </SidebarLink>
          </li>
          <li style={{ marginBottom: '28px' }}>
            <SidebarLink to="/new-input" active={isActive('/new-input')}>
              <i
                className="fa fa-plus-circle rotating-icon"
                style={{ marginRight: '14px', width: '22px', textAlign: 'center', flexShrink: 0 }}
              />
              <span style={{ flex: 1, textAlign: 'left' }}>New Input</span>
            </SidebarLink>
          </li>
          <li style={{ marginBottom: '28px' }}>
            <SidebarLink to="/simulation" active={isActive('/simulation')}>
              <i
                className="fa fa-play-circle rotating-icon"
                style={{ marginRight: '14px', width: '22px', textAlign: 'center', flexShrink: 0 }}
              />
              <span style={{ flex: 1, textAlign: 'left' }}>Simulation</span>
            </SidebarLink>
          </li>
          <li>
            <SidebarLink to="/generate-report" active={isActive('/generate-report')}>
              <i
                className="fa fa-file-alt rotating-icon"
                style={{ marginRight: '14px', width: '22px', textAlign: 'center', flexShrink: 0 }}
              />
              <span style={{ flex: 1, textAlign: 'left' }}>Generate Report</span>
            </SidebarLink>
          </li>
        </ul>
      </nav>
    </div>
  );
};

const SidebarLink = ({ to, active, children }) => {
  const baseStyle = {
    display: 'flex',
    alignItems: 'center',
    textDecoration: 'none',
    color: 'white',
    fontWeight: 600,
    fontSize: '20px',
    padding: '10px 15px',
    borderRadius: '8px',
    transition: 'all 0.25s ease',
    userSelect: 'none',
    cursor: 'pointer',
    backgroundColor: active ? '#3a3a5a' : 'transparent',
    boxShadow: active ? '0 0 10px rgba(58, 58, 90, 0.7)' : 'none',
  };

  return (
    <>
      <Link to={to} style={baseStyle} className="sidebar-link">
        {children}
      </Link>
      <style>{`
        .sidebar-link:hover {
          background-color: #48486d;
          color: #f0f0f0;
          box-shadow: 0 0 12px rgba(72, 72, 109, 0.8);
          text-decoration: none;
        }
        .sidebar-link:hover i {
          color: #a0a0ff;
          animation: rotateIcon 1s linear infinite;
        }
        @keyframes rotateIcon {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
};

export default Sidebar;
