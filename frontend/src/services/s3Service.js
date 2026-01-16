import axios from 'axios';

/**
 * Service pour gérer les uploads vers AWS S3
 * Utilise des URLs présignées générées par le backend
 */

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

/**
 * Récupérer une URL présignée du backend
 */
export const getPresignedUrl = async (fileName, fileType) => {
  try {
    const response = await axios.post(`${API_URL}/api/s3/presigned-url`, {
      fileName,
      fileType,
      timestamp: Date.now()
    });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'URL présignée:', error);
    throw error;
  }
};

/**
 * Uploader un fichier vers S3 avec une URL présignée
 */
export const uploadToS3 = async (presignedUrl, file) => {
  try {
    const response = await axios.put(presignedUrl, file, {
      headers: {
        'Content-Type': file.type
      }
    });
    return response.status === 200;
  } catch (error) {
    console.error('Erreur lors de l\'upload vers S3:', error);
    throw error;
  }
};

/**
 * Upload complet: récupérer URL présignée + uploader fichier
 */
export const uploadFile = async (file) => {
  try {
    // 1. Récupérer une URL présignée
    const { presignedUrl, fileKey } = await getPresignedUrl(
      file.name,
      file.type
    );

    // 2. Uploader le fichier
    await uploadToS3(presignedUrl, file);

    // 3. Retourner l'URL S3 publique
    const s3Url = `${presignedUrl.split('?')[0]}`;
    
    return {
      success: true,
      fileKey,
      fileUrl: s3Url
    };
  } catch (error) {
    console.error('Erreur lors de l\'upload du fichier:', error);
    throw error;
  }
};

/**
 * Supprimer un fichier de S3
 */
export const deleteFile = async (fileKey) => {
  try {
    const response = await axios.delete(`${API_URL}/api/s3/file/${fileKey}`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la suppression du fichier:', error);
    throw error;
  }
};

/**
 * Générer une URL publique S3
 */
export const getS3PublicUrl = (s3Url) => {
  if (!s3Url) return null;
  // Si c'est une URL complète, la retourner
  if (s3Url.startsWith('https://')) return s3Url;
  // Sinon, construire l'URL
  return `${API_URL}/api/s3/file/${s3Url}`;
};

export default {
  getPresignedUrl,
  uploadToS3,
  uploadFile,
  deleteFile,
  getS3PublicUrl
};
