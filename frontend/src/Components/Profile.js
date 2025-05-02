import React, { useEffect, useState } from 'react';
import { Box, TextField, Button, Typography, Card, CardContent, Grid, Avatar } from '@mui/material';
import Swal from 'sweetalert2';
import axios from 'axios';

const Profile = ({ handleUserUpdate }) => {
  const storedUser = JSON.parse(localStorage.getItem('user')) || {};
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(storedUser.name || '');
  const [email, setEmail] = useState(storedUser.email || '');
  const [profilePic, setProfilePic] = useState(storedUser.profilePic || '');
  const [file, setFile] = useState(null);

  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  useEffect(() => {
    const userFromStorage = JSON.parse(localStorage.getItem('user'));
    if (userFromStorage) {
      setName(userFromStorage.name);
      setEmail(userFromStorage.email);
      setProfilePic(userFromStorage.profilePic);
    }
  }, []);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    setNameError('');
    setEmailError('');
  };

  const validateFields = () => {
    let valid = true;

    if (!name.trim()) {
      setNameError('Name cannot be empty');
      valid = false;
    } else {
      setNameError('');
    }

    if (!email || !emailRegex.test(email)) {
      setEmailError('Please enter a valid email address');
      valid = false;
    } else {
      setEmailError('');
    }

    return valid;
  };

  const handleSaveChanges = async () => {
    if (!validateFields()) return;
  
    const userId = storedUser._id;
    if (!userId) {
      Swal.fire('User ID is missing', '', 'error');
      return;
    }
  
    let newProfilePicPath = profilePic;
  
    // Upload image if selected
    if (file) {
      const imageFormData = new FormData();
      imageFormData.append('userId', userId);
      imageFormData.append('profilePic', file); // important: 'profilePic' key matches multer's expectation
  
      try {
        const res = await axios.post('http://localhost:5000/api/auth/upload-profile-pic', imageFormData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
  
        newProfilePicPath = res.data.filePath;
        setProfilePic(newProfilePicPath);
      } catch (error) {
        console.error(error);
        Swal.fire('Error uploading profile picture', '', 'error');
        return;
      }
    }
  
    // Now update user details
    try {
      const response = await axios.put('http://localhost:5000/api/auth/update-profile', {
        userId,
        name,
        email,
        profilePic: newProfilePicPath,
      });
  
      localStorage.setItem('user', JSON.stringify(response.data.user));
      handleUserUpdate(response.data.user);
      Swal.fire(response.data.message, '', 'success');
      setIsEditing(false);
    } catch (error) {
      Swal.fire(error.response?.data?.message || 'Error updating profile', '', 'error');
    }
  };
  

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) setFile(selected);
  };

  return (
    <Box sx={{ mt: 5, display: 'flex', justifyContent: 'center' }}>
      <Card sx={{ minWidth: 400, p: 2, textAlign: 'center' }}>
        <CardContent>
          <Typography variant="h4" gutterBottom>Profile</Typography>

          {/* Avatar Upload via Click */}
          <label htmlFor="profilePicInput" style={{ cursor: isEditing ? 'pointer' : 'default' }}>
            <Avatar
              alt="Profile Picture"
              src={
                file
                  ? URL.createObjectURL(file)
                  : profilePic
                  ? `http://localhost:5000${profilePic}`
                  : '/default-profile.png'
              }
              sx={{ width: 100, height: 100, mb: 2, mx: 'auto' }}
            />
          </label>
          {isEditing && (
            <input
              id="profilePicInput"
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
          )}

          <Grid container spacing={2} direction="column">
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={!isEditing}
                error={!!nameError}
                helperText={nameError}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={!isEditing}
                error={!!emailError}
                helperText={emailError}
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 2 }}>
            {isEditing ? (
              <>
                <Button variant="contained" color="primary" onClick={handleSaveChanges} sx={{ mr: 2 }}>
                  Save Changes
                </Button>
                <Button variant="outlined" color="secondary" onClick={handleEditToggle}>
                  Cancel
                </Button>
              </>
            ) : (
              <Button variant="contained" color="primary" onClick={handleEditToggle}>
                Edit Profile
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Profile;
