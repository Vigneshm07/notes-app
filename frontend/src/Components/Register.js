import { useState } from 'react';
import { TextField, Button, Box, Typography, Container } from '@mui/material';
import Swal from 'sweetalert2';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  // Real-time validation
  const validate = (fieldValues = form) => {
    const temp = { ...errors };
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if ('name' in fieldValues) {
      temp.name = fieldValues.name ? '' : 'Name is required';
    }

    if ('email' in fieldValues) {
      if (!fieldValues.email) {
        temp.email = 'Email is required';
      } else if (!fieldValues.email.includes('@')) {
        temp.email = 'Email must contain "@"';
      } else if (!fieldValues.email.includes('.')) {
        temp.email = 'Email must contain "."';
      } else if (!emailRegex.test(fieldValues.email)) {
        temp.email = 'Enter a valid email address';
      } else {
        temp.email = '';
      }
    }

    if ('password' in fieldValues) {
      if (!fieldValues.password) {
        temp.password = 'Password is required';
      } else if (fieldValues.password.length < 6) {
        temp.password = 'Password must be at least 6 characters';
      } else {
        temp.password = '';
      }
    }

    setErrors({ ...temp });

    return Object.values(temp).every(x => x === '');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    validate({ [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await axios.post('http://localhost:5000/api/auth/register', form);
      Swal.fire('Success', 'Registration successful!', 'success');
      navigate('/login');
    } catch (err) {
      if (err.response?.data?.message === 'Email already registered') {
        Swal.fire('Error', 'Email already registered', 'error');
        navigate('/login');
      } else {
        Swal.fire('Error', err.response?.data?.message || 'Something went wrong', 'error');
      }
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Register
        </Typography>
        <form onSubmit={handleSubmit} noValidate>
          <TextField
            label="Name"
            name="name"
            fullWidth
            margin="normal"
            value={form.name}
            onChange={handleChange}
            error={!!errors.name}
            helperText={errors.name}
          />
          <TextField
            label="Email"
            name="email"
            fullWidth
            margin="normal"
            value={form.email}
            onChange={handleChange}
            error={!!errors.email}
            helperText={errors.email}
          />
          <TextField
            label="Password"
            name="password"
            type="password"
            fullWidth
            margin="normal"
            value={form.password}
            onChange={handleChange}
            error={!!errors.password}
            helperText={errors.password}
          />
          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
            Register
          </Button>
        </form>
      </Box>
    </Container>
  );
};

export default Register;
