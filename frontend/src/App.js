import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import Home from './Components/Home';
import Login from './Components/Login';
import Register from './Components/Register';
import Navbar from './Components/NavBar';
import Swal from 'sweetalert2';
import Profile from './Components/Profile';

function AppContent() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    try {
      if (storedUser && storedUser !== 'undefined') {
        setUser(JSON.parse(storedUser)); // Safely parse the user data
      }
    } catch (err) {
      console.error('Failed to parse user from localStorage:', err);
      localStorage.removeItem('user'); // Clean up corrupted data
    }
  }, []);

  const handleLogin = (user, token) => {
    if (user && token) {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user)); // Store user data in localStorage
      setUser(user); // Update state with user data
      navigate('/'); // Navigate to home after login
    }
  };

  const handleLogout = () => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You will be logged out from your account!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Logout',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null); // Reset user state
        navigate('/login'); // Navigate to login page
        Swal.fire('Logged out!', 'You have been logged out successfully.', 'success');
      }
    });
  };

  const handleUserUpdate = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser)); // Save updated user data
  };

  return (
    <>
      <Navbar user={user} handleLogout={handleLogout} />
      <Routes>
        <Route path="/" element={<Home user={user} />} />
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/profile"
          element={<Profile user={user} handleUserUpdate={handleUserUpdate} />}
        />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
