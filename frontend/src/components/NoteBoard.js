import React from 'react';
import Note from './Note';
import './NoteBoard.css';

function NoteBoard({ notes, onUpdateNote, onDeleteNote }) {
  return (
    <div className="note-board">
      {notes.map(note => (
        <Note
          key={note.id}
          note={note}
          onUpdate={onUpdateNote}
          onDelete={onDeleteNote}
        />
      ))}
      {notes.length === 0 && (
        <div className="empty-state">
          <p>📌 Aucune note pour le moment</p>
          <p>Créez votre première note!</p>
        </div>
      )}
    </div>
  );
}

export default NoteBoard;
