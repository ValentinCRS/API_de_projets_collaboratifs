const jwt = require('jsonwebtoken');
const { Project } = require('../models/project.model');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Accès refusé. Le token est manquant.' });

  jwt.verify(token, process.env.JWT_SECRET || 'dev_secret_change_me', (err, user) => {
    if (err) return res.status(401).json({ message: 'Token invalide ou expiré.' });
    req.user = user;
    next();
  });
};

const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: 'Non authentifié' });
  if (!roles.includes(req.user.role)) return res.status(403).json({ message: 'Droit insuffisant' });
  next();
};

const requireOrganizerOrAdmin = async (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Non authentifié' });
    if (req.user.role === 'admin') return next();

    const { id } = req.params;
    const project = await Project.findByPk(id);
    if (!project) return res.status(404).json({ message: `Projet ${id} introuvable` });

    const isOrganizer = [req.user.email, req.user.name].filter(Boolean).includes(project.organizer);
    if (!isOrganizer) return res.status(403).json({ message: 'Réservé à l’organizer du projet ou admin' });

    next();
  } catch (err) {
    console.error('Organizer check error:', err);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

module.exports = { verifyToken, requireRole, requireOrganizerOrAdmin };