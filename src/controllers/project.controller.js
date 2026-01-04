const { Project } = require("../models/project.model");
const fs = require('fs');
const path = require('path');

// Créer un projet
exports.createProject = async (req, res) => {
  try {
    const { name, description, organizer } = req.body;

    if (!name || !organizer) {
      return res.status(400).json({ message: "name et organizer sont requis" });
    }
    if (!req.file) {
      return res.status(415).json({ message: "Un fichier PDF (champ 'image') est requis" });
    }

    const specFile = req.file.filename; 

    const project = await Project.create({ name, description, organizer, specFile });
    return res.status(201).json(project);
  } catch (err) {
    console.error("createProject error:", err);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

// Lister
exports.getAllProjects = async (_req, res) => {
  const projects = await Project.findAll();
  res.status(200).json(projects);
};

// Détail
exports.getProjectById = async (req, res) => {
  const { id } = req.params;
  const project = await Project.findByPk(id);
  if (!project) return res.status(404).json({ message: `Projet ${id} introuvable` });
  res.status(200).json(project);
};

// Modifie un projet
exports.updateProject = async (req, res) => {
  try {
    const projectId = req.params.id;
    const project = await Project.findByPk(projectId);
    
    if (!project) {
      return res.status(404).json({ message: `Projet ${projectId} introuvable` });
    }

    const { name, description, organizer } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (organizer !== undefined) updates.organizer = organizer;
    if (req.file && req.file.filename) updates.specFile = req.file.filename;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'Aucun champ à mettre à jour' });
    }

    await project.update(updates);

    const projectJson = project.toJSON();

    return res.status(200).json(projectJson);

  } catch (err) {
    console.error("Erreur de mise à jour du projet:", err);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

// Supprime un projet
exports.deleteProject = async (req, res) => {
  try {
    const projectId = req.params.id;
    const project = await Project.findByPk(projectId);

    if (!project) {
      return res.status(404).json({ message: `Projet ${projectId} introuvable` });
    }

    const specFile = project.specFile;
    await project.destroy();

    if (specFile) {
      const filePath = path.join(__dirname, '..', '..', 'public', 'uploads', specFile);
      fs.unlink(filePath, (err) => {
        if (err) console.warn(`Impossible de supprimer le fichier ${filePath}:`, err.message);
      });
    }

    return res.status(200).json({ message: `Projet ${projectId} supprimé` });

  } catch (err) {
    console.error("Erreur de suppression du projet:", err);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};