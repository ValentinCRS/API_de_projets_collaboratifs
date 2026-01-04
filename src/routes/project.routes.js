const express = require('express');
const router = express.Router();
const projectController = require('../controllers/project.controller');
const upload = require('../middlewares/upload.middleware');
const { verifyToken, requireOrganizerOrAdmin } = require('../middlewares/auth.middleware');

// Créer 
router.post('/', verifyToken, upload.single('image'), projectController.createProject);

// Lister et Détail 
router.get('/', projectController.getAllProjects);
router.get('/:id', projectController.getProjectById);

// Mettre à jour 
router.put('/:id', verifyToken, requireOrganizerOrAdmin, upload.single('image'), projectController.updateProject);

// Supprimer 
router.delete('/:id', verifyToken, requireOrganizerOrAdmin, projectController.deleteProject);

module.exports = router;