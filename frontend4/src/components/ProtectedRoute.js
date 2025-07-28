import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ component: Component, isAuthenticated }) => {
  // Jika tidak terautentikasi, arahkan ke login
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Jika terautentikasi, tampilkan komponen yang diminta
  return <Component />;
};

export default ProtectedRoute;
