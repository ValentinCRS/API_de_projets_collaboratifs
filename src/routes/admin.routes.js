const express = require('express');
const router = express.Router();
const { Member } = require('../models/member.model');
const { verifyToken, requireRole } = require('../middlewares/auth.middleware');

// Admin: lister tous les membres
router.get('/members', verifyToken, requireRole('admin'), async (_req, res) => {
  const members = await Member.findAll({ attributes: { exclude: ['password'] }, order: [['id', 'ASC']] });
  res.status(200).json(members);
});

// Admin: changer le rôle d'un membre
router.put('/members/:id/role', verifyToken, requireRole('admin'), async (req, res) => {
  const { id } = req.params;
  const { role } = req.body || {};
  if (!role) return res.status(400).json({ message: 'role requis' });

  const member = await Member.findByPk(id);
  if (!member) return res.status(404).json({ message: `Membre ${id} introuvable` });

  await member.update({ role });
  const { password: _, ...safe } = member.toJSON();
  res.status(200).json(safe);
});

// Admin: supprimer un membre
router.delete('/members/:id', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    
    const member = await Member.findByPk(id);
    if (!member) {
      return res.status(404).json({ message: `Membre ${id} introuvable` });
    }

    // Empêche la suppression de son propre compte
    if (req.user.id === parseInt(id)) {
      return res.status(403).json({ message: 'Impossible de supprimer votre propre compte' });
    }

    await member.destroy();
    res.status(200).json({ message: `Membre ${id} supprimé avec succès` });

  } catch (error) {
    console.error('Erreur lors de la suppression du membre:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la suppression' });
  }
});

module.exports = router;