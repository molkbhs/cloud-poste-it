import React, { useState, useEffect } from 'react';
import axios from 'axios';
import NoteBoard from './components/NoteBoard';
import NewNoteForm from './components/NewNoteForm';
import './App.css';

const API_URL = 'http://localhost:5000/api/notes';

function App() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Charger les notes au démarrage
  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const response = await axios.get(API_URL);
      setNotes(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors de la récupération des notes:', error);
      setLoading(false);
    }
  };

  const addNote = async (noteData) => {
    try {
      const response = await axios.post(API_URL, noteData);
      setNotes([...notes, response.data]);
      setShowForm(false);
    } catch (error) {
      console.error('Erreur lors de la création de la note:', error);
    }
  };

  const updateNote = async (id, updates) => {
    try {
      const response = await axios.put(`${API_URL}/${id}`, updates);
      setNotes(notes.map(note => note.id === id ? response.data : note));
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la note:', error);
    }
  };

  const deleteNote = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      setNotes(notes.filter(note => note.id !== id));
    } catch (error) {
      console.error('Erreur lors de la suppression de la note:', error);
    }
  };

  if (loading) {
    return <div className="loading">Chargement des notes...</div>;
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>📝 Post-it Board</h1>
        <p>Organisez vos idées avec des notes adhésives</p>
      </header>

      <button 
        className="add-note-btn" 
        onClick={() => setShowForm(!showForm)}
      >
        + Nouvelle Note
      </button>

      {showForm && (
        <NewNoteForm 
          onAdd={addNote} 
          onCancel={() => setShowForm(false)}
        />
      )}

      <NoteBoard 
        notes={notes}
        onUpdateNote={updateNote}
        onDeleteNote={deleteNote}
      />
    </div>
  );
}

export default App;
