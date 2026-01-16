import React, { useState, useRef, useCallback } from 'react';
import './Note.css';

const COLORS = [
  '#FFD700', // Or
  '#FFB6C1', // Rose
  '#87CEEB', // Bleu ciel
  '#90EE90', // Vert clair
  '#FFE4B5', // Pêche
  '#DDA0DD', // Prune
  '#F0E68C', // Khaki
  '#FFA07A'  // Saumon
];

function Note({ note, onUpdate, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(note.title);
  const [editContent, setEditContent] = useState(note.content);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const noteRef = useRef(null);

  const handleMouseDown = (e) => {
    if (e.target.closest('.note-delete') || 
        e.target.closest('.note-color') ||
        isEditing) {
      return;
    }

    setIsDragging(true);
    setDragOffset({
      x: e.clientX - note.x,
      y: e.clientY - note.y
    });
  };

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;

    const newX = e.clientX - dragOffset.x;
    const newY = e.clientY - dragOffset.y;

    onUpdate(note.id, { x: newX, y: newY });
  }, [isDragging, dragOffset, note.id, onUpdate]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  React.useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const handleSaveEdit = () => {
    onUpdate(note.id, {
      title: editTitle,
      content: editContent
    });
    setIsEditing(false);
  };

  const handleColorChange = (color) => {
    onUpdate(note.id, { color });
  };

  return (
    <div
      ref={noteRef}
      className="note"
      style={{
        left: `${note.x}px`,
        top: `${note.y}px`,
        backgroundColor: note.color,
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="note-header">
        <button 
          className="note-delete"
          onClick={() => onDelete(note.id)}
          title="Supprimer"
        >
          ✕
        </button>
        <button 
          className="note-edit"
          onClick={() => setIsEditing(!isEditing)}
          title="Éditer"
        >
          ✎
        </button>
      </div>

      {isEditing ? (
        <div className="note-edit-form">
          <input
            type="text"
            className="note-edit-title"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            placeholder="Titre"
            autoFocus
          />
          <textarea
            className="note-edit-content"
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            placeholder="Contenu"
          />
          <div className="note-edit-actions">
            <button 
              className="btn-save"
              onClick={handleSaveEdit}
            >
              Enregistrer
            </button>
            <button 
              className="btn-cancel"
              onClick={() => {
                setEditTitle(note.title);
                setEditContent(note.content);
                setIsEditing(false);
              }}
            >
              Annuler
            </button>
          </div>
        </div>
      ) : (
        <div className="note-content">
          <h3 className="note-title">{note.title}</h3>
          {note.imageUrl && (
            <div className="note-image">
              <img 
                src={note.imageUrl} 
                alt="Note image" 
                style={{ maxWidth: '100%', borderRadius: '4px', marginBottom: '10px' }}
              />
            </div>
          )}
          <p className="note-text">{note.content}</p>
        </div>
      )}

      <div className="note-footer">
        <div className="note-colors">
          {COLORS.map(color => (
            <button
              key={color}
              className="color-btn"
              style={{ backgroundColor: color }}
              onClick={() => handleColorChange(color)}
              title="Changer la couleur"
            />
          ))}
        </div>
        <small className="note-date">
          {new Date(note.updatedAt).toLocaleDateString('fr-FR')}
        </small>
      </div>
    </div>
  );
}

export default Note;
