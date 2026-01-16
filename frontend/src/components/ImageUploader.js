import React, { useState } from 'react';
import { uploadFile } from '../services/s3Service';

const ImageUploader = ({ onImageUpload, onError }) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
      onError('Veuillez sélectionner une image');
      return;
    }

    // Vérifier la taille (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      onError('L\'image ne doit pas dépasser 5 MB');
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      // Simuler la progression
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 30;
        });
      }, 100);

      // Uploader le fichier
      const result = await uploadFile(file);

      clearInterval(progressInterval);
      setProgress(100);

      // Appeler le callback
      if (onImageUpload) {
        onImageUpload({
          url: result.fileUrl,
          key: result.fileKey,
          name: file.name
        });
      }

      // Reset après 1 seconde
      setTimeout(() => {
        setUploading(false);
        setProgress(0);
        event.target.value = '';
      }, 1000);
    } catch (error) {
      console.error('Erreur d\'upload:', error);
      onError(error.message || 'Erreur lors de l\'upload');
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <div style={styles.container}>
      <label htmlFor="image-upload" style={styles.label}>
        {uploading ? (
          <>
            <span>📤 Upload en cours... {Math.round(progress)}%</span>
            <div style={styles.progressBar}>
              <div 
                style={{
                  ...styles.progressFill,
                  width: `${progress}%`
                }}
              />
            </div>
          </>
        ) : (
          <span>🖼️ Ajouter une image</span>
        )}
      </label>
      <input
        id="image-upload"
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={uploading}
        style={styles.input}
      />
    </div>
  );
};

const styles = {
  container: {
    marginBottom: '10px'
  },
  label: {
    display: 'block',
    padding: '8px 12px',
    backgroundColor: '#e8f4f8',
    border: '1px dashed #87CEEB',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    color: '#0066cc',
    transition: 'all 0.3s ease',
    textAlign: 'center'
  },
  input: {
    display: 'none'
  },
  progressBar: {
    width: '100%',
    height: '4px',
    backgroundColor: '#ddd',
    borderRadius: '2px',
    marginTop: '4px',
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#87CEEB',
    transition: 'width 0.3s ease'
  }
};

export default ImageUploader;
