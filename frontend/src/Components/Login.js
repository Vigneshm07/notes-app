import React, { useState } from 'react';
import { TextField, Button, Typography, Box } from '@mui/material';
import Swal from 'sweetalert2';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      Swal.fire('All fields are required', '', 'warning');
      return;
    }

    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password,
      });

      if (res.data.token) {
        // Save token and user details to localStorage
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        console.log(JSON.parse(localStorage.getItem('user')));

        // Call the onLogin function passed via props to update the state
        if (onLogin) onLogin(res.data.user, res.data.token);

        Swal.fire('Login successful!', '', 'success');
        navigate('/'); // Navigate to home page after login
      }
    } catch (error) {
      Swal.fire(error.response?.data?.message || 'Login failed', '', 'error');
    }
  };

  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', mt: 5 }}>
      <Typography variant="h5" mb={2}>Login</Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Email"
          type="email"
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <TextField
          fullWidth
          label="Password"
          type="password"
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Button fullWidth variant="contained" color="primary" type="submit" sx={{ mt: 2 }}>
          Login
        </Button>
      </form>
    </Box>
  );
};

export default Login;
