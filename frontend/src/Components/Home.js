import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Modal,
  TextField,
  Grid,
  IconButton
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import Swal from 'sweetalert2';
import axios from 'axios';

const Home = ({ user }) => {
  const storedUser = user || (() => {
    try {
      const item = localStorage.getItem('user');
      return item && item !== 'undefined' ? JSON.parse(item) : null;
    } catch (err) {
      console.error('Failed to parse user from localStorage:', err);
      return null;
    }
  })();

  const [modalOpen, setModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [subjectError, setSubjectError] = useState('');
  const [descriptionError, setDescriptionError] = useState('');
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editNoteId, setEditNoteId] = useState(null);

  const handleOpen = () => {
    setIsEditing(false);
    setModalOpen(true);
    setSubjectError('');
    setDescriptionError('');
  };

  const handleClose = () => {
    setModalOpen(false);
    setSubject('');
    setDescription('');
    setSubjectError('');
    setDescriptionError('');
    setIsEditing(false);
    setEditNoteId(null);
  };

  const handleOpenViewModal = (note) => {
    setSelectedNote(note);
    setViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setSelectedNote(null);
    setViewModalOpen(false);
  };

  const fetchNotes = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/notes/${storedUser._id}`);
      setNotes(res.data);
    } catch (err) {
      console.error('Error fetching notes:', err);
    }
  };

  const handleSaveNote = async () => {
    let hasError = false;
    if (!subject.trim()) {
      setSubjectError('Subject is required');
      hasError = true;
    } else {
      setSubjectError('');
    }

    if (!description.trim()) {
      setDescriptionError('Description is required');
      hasError = true;
    } else {
      setDescriptionError('');
    }

    if (hasError) return;

    try {
      if (isEditing) {
        const res = await axios.put(`http://localhost:5000/api/notes/${editNoteId}`, {
          subject,
          description
        });
        setNotes((prev) =>
          prev.map((note) => (note._id === editNoteId ? res.data : note))
        );
        Swal.fire('Updated!', 'Note updated successfully.', 'success');
      } else {
        const res = await axios.post('http://localhost:5000/api/notes', {
          userId: storedUser._id,
          subject,
          description
        });
        setNotes((prev) => [...prev, res.data]);
        Swal.fire('Saved!', 'Note added successfully.', 'success');
      }
      handleClose();
    } catch (err) {
      console.error('Error saving note:', err);
      Swal.fire('Error!', 'Something went wrong while saving the note.', 'error');
    }
  };

  const handleEditNote = (note) => {
    setIsEditing(true);
    setEditNoteId(note._id);
    setSubject(note.subject);
    setDescription(note.description);
    setModalOpen(true);
    setSubjectError('');
    setDescriptionError('');
  };

  const handleDeleteNote = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This note will be deleted permanently.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`http://localhost:5000/api/notes/${id}`);
        setNotes((prev) => prev.filter((note) => note._id !== id));
        Swal.fire('Deleted!', 'Note has been deleted.', 'success');
      } catch (err) {
        console.error('Error deleting note:', err);
        Swal.fire('Error!', 'Failed to delete the note.', 'error');
      }
    }
  };

  useEffect(() => {
    if (storedUser) fetchNotes();
  }, []);

  return (
    <Box sx={{ mt: 5, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Typography variant="h4" gutterBottom>Welcome to Notes App</Typography>

      {storedUser && (
        <Button variant="contained" color="primary" onClick={handleOpen} sx={{ mb: 3 }}>
          Add Note
        </Button>
      )}

      {!storedUser ? (
        <Typography color="error">Please log in to access your notes.</Typography>
      ) : (
        <Box sx={{ width: '100%', maxWidth: 800 }}>
          {notes.length === 0 ? (
            <Typography>No notes yet.</Typography>
          ) : (
            notes.map((note) => (
              <Card key={note._id} sx={{ mb: 2, position: 'relative' }}>
                <CardContent>
                  <Typography variant="h6">{note.subject}</Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      overflow: 'hidden',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical'
                    }}
                  >
                    {note.description}
                  </Typography>
                  {note.description.length > 100 && (
                    <Button
                      onClick={() => handleOpenViewModal(note)}
                      size="small"
                      sx={{ mt: 1 }}
                    >
                      Read More
                    </Button>
                  )}
                </CardContent>
                <Box sx={{ position: 'absolute', top: 10, right: 10 }}>
                  <IconButton onClick={() => handleEditNote(note)}>
                    <Edit fontSize="small" />
                  </IconButton>
                  <IconButton onClick={() => handleDeleteNote(note._id)}>
                    <Delete fontSize="small" />
                  </IconButton>
                </Box>
              </Card>
            ))
          )}
        </Box>
      )}

      {/* Add/Edit Note Modal */}
      <Modal open={modalOpen} onClose={handleClose}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            borderRadius: 2
          }}
        >
          <Typography variant="h6" gutterBottom>
            {isEditing ? 'Edit Note' : 'Add Note'}
          </Typography>
          <Grid container spacing={2} direction="column">
            <Grid item>
              <TextField
                fullWidth
                label="Subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                error={!!subjectError}
                helperText={subjectError}
              />
            </Grid>
            <Grid item>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                error={!!descriptionError}
                helperText={descriptionError}
              />
            </Grid>
          </Grid>
          <Box mt={2} textAlign="right">
            <Button onClick={handleClose} sx={{ mr: 2 }}>Cancel</Button>
            <Button variant="contained" onClick={handleSaveNote}>
              {isEditing ? 'Update' : 'Save'}
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* View Full Note Modal */}
      <Modal open={viewModalOpen} onClose={handleCloseViewModal}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 500,
            maxHeight: '80vh',
            overflowY: 'auto',
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            borderRadius: 2
          }}
        >
          {selectedNote && (
            <>
              <Typography variant="h6" gutterBottom>{selectedNote.subject}</Typography>
              <Typography variant="body1">{selectedNote.description}</Typography>
              <Box mt={2} textAlign="right">
                <Button onClick={handleCloseViewModal} variant="outlined">Close</Button>
              </Box>
            </>
          )}
        </Box>
      </Modal>
    </Box>
  );
};

export default Home;
