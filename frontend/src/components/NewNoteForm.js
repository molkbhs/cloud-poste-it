import React, { useState } from 'react';
import './NewNoteForm.css';
import ImageUploader from './ImageUploader';
import * as s3Service from '../services/s3Service';

const COLORS = [
  '#FFD700', '#FFB6C1', '#87CEEB', '#90EE90',
  '#FFE4B5', '#DDA0DD', '#F0E68C', '#FFA07A'
];

function NewNoteForm({ onAdd, onCancel }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [color, setColor] = useState('#FFD700');
  const [imageUrl, setImageUrl] = useState('');
  const [imageKey, setImageKey] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    onAdd({
      title: title || 'Sans titre',
      content,
      color,
      imageUrl,
      imageKey,
      x: Math.random() * (window.innerWidth - 300),
      y: Math.random() * (window.innerHeight - 400) + 150
    });

    setTitle('');
    setContent('');
    setColor('#FFD700');
    setImageUrl('');
    setImageKey('');
  };

  const handleImageUpload = async (file) => {
    try {
      const { url, key } = await s3Service.uploadFile(file);
      setImageUrl(url);
      setImageKey(key);
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error);
      alert('Erreur lors du téléchargement de l\'image');
    }
  };

  const handleImageError = (error) => {
    console.error('Erreur d\'image:', error);
    alert('Erreur: ' + error);
  };

  return (
    <div className="form-overlay">
      <div className="form-container">
        <h2>✏️ Créer une nouvelle note</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Titre</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Entrez le titre de la note..."
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="content">Contenu</label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Écrivez le contenu de votre note..."
              rows="6"
            />
          </div>

          <div className="form-group">
            <label>📷 Image (optionnel)</label>
            <ImageUploader 
              onImageUpload={handleImageUpload}
              onError={handleImageError}
            />
            {imageUrl && (
              <div className="image-preview">
                <img src={imageUrl} alt="Aperçu" style={{ maxWidth: '150px', marginTop: '10px' }} />
                <button 
                  type="button"
                  className="btn-remove-image"
                  onClick={() => {
                    setImageUrl('');
                    setImageKey('');
                  }}
                >
                  ✕ Supprimer l'image
                </button>
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Couleur</label>
            <div className="color-picker">
              {COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  className={`color-option ${color === c ? 'selected' : ''}`}
                  style={{ backgroundColor: c }}
                  onClick={() => setColor(c)}
                />
              ))}
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-create">Créer la note</button>
            <button 
              type="button" 
              className="btn-cancel-form"
              onClick={onCancel}
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default NewNoteForm;
