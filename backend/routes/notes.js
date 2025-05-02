const express = require('express');
const router = express.Router();
const Note = require('../models/Note');

// Add new note
router.post('/', async (req, res) => {
  const { userId, subject, description } = req.body;

  if (!userId || !subject || !description) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const newNote = new Note({ userId, subject, description });
    await newNote.save();
    res.status(201).json(newNote);
  } catch (error) {
    res.status(500).json({ message: 'Error saving note' });
  }
});

// Get notes by userId
router.get('/:userId', async (req, res) => {
  try {
    const notes = await Note.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.status(200).json(notes);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notes' });
  }
});

router.put('/:id', async (req, res) => {
    const { subject, description } = req.body;
  
    try {
      const updatedNote = await Note.findByIdAndUpdate(
        req.params.id,
        { subject, description },
        { new: true }
      );
      if (!updatedNote) {
        return res.status(404).json({ message: 'Note not found' });
      }
      res.json(updatedNote);
    } catch (err) {
      console.error('Update error:', err);
      res.status(500).json({ message: 'Failed to update note' });
    }
  });
  
  // DELETE a note by ID
  router.delete('/:id', async (req, res) => {
    try {
      const deletedNote = await Note.findByIdAndDelete(req.params.id);
      if (!deletedNote) {
        return res.status(404).json({ message: 'Note not found' });
      }
      res.json({ message: 'Note deleted' });
    } catch (err) {
      console.error('Delete error:', err);
      res.status(500).json({ message: 'Failed to delete note' });
    }
  });

module.exports = router;
