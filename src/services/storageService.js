const { storage } = require('../config/firebase');
const logger = require('../utils/logger');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const storageService = {
    /**
     * Upload un fichier vers Firebase Storage
     * @param {Buffer} fileBuffer Le contenu du fichier
     * @param {string} destination Chemin de destination (ex: 'avatars/users/uid.png')
     * @param {string} contentType Type MIME du fichier
     */
    async uploadFile(fileBuffer, destination, contentType) {
        try {
            const bucket = storage.bucket();
            const file = bucket.file(destination);

            await file.save(fileBuffer, {
                metadata: { contentType },
                public: true
            });

            // Récupérer l'URL publique
            const publicUrl = `https://storage.googleapis.com/${bucket.name}/${destination}`;
            logger.info(`File uploaded successfully to ${destination}`);
            return publicUrl;
        } catch (error) {
            logger.error('Error uploading file to Storage:', error);
            throw error;
        }
    },

    /**
     * Supprime un fichier de Firebase Storage
     */
    async deleteFile(destination) {
        try {
            const bucket = storage.bucket();
            await bucket.file(destination).delete();
            logger.info(`File deleted: ${destination}`);
        } catch (error) {
            logger.error('Error deleting file from Storage:', error);
            // On ne throw pas forcément ici si le fichier n'existe déjà plus
        }
    }
};

module.exports = storageService;
