const { Member } = require("../models/member.model");
const { Project } = require("../models/project.model");
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

exports.register = async (req, res) => {
  try {
    let { name, email, password, projectId, role } = req.body; 
    if (!name || !email || !password || !projectId) {
      return res.status(400).json({ message: "name, email, password et projectId sont requis" });
    }

    email = String(email).trim().toLowerCase();

    // Vérifie que le projet existe
    const project = await Project.findByPk(projectId);
    if (!project) {
      return res.status(404).json({ message: `Projet ${projectId} introuvable` });
    }

    const existing = await Member.findOne({ where: { email } });
    if (existing) return res.status(409).json({ message: "Email déjà utilisé" });

    // Rôle: par défaut "user", sauf si demandé "admin"
    const requestedRole = String(role || '').toLowerCase();
    const assignedRole = requestedRole === 'admin' ? 'admin' : 'user';

    const member = await Member.create({
      name,
      email,
      password,               // TODO: hash plus tard
      role: assignedRole,
      projectId,
    });

    const { password: _, ...safe } = member.toJSON();
    return res.status(201).json(safe);
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

exports.login = async (req, res) => {
  try {
    let { email, password } = req.body;
    email = String(email || '').trim().toLowerCase();

    const member = await Member.findOne({ where: { email } });
    console.log('[LOGIN] email:', email, 'found?', !!member, 'hasPassword?', !!(member && member.password));
    if (!member) return res.status(401).json({ message: "Identifiant ou mot de passe invalide" });

    const matches = await member.passwordMatches(password);
    console.log('[LOGIN] matches?', matches);
    if (!matches) return res.status(401).json({ message: "Identifiant ou mot de passe invalide" });

    const { password: _, ...safe } = member.toJSON();
    if (member.role === 'admin') {
      const token = jwt.sign({ id: member.id, email: member.email, role: member.role, name: member.name }, JWT_SECRET, { expiresIn: '1h' });
      return res.status(200).json({ message: "Vous êtes bien authentifié (admin)", token, member: safe });
    }
    return res.status(200).json({ message: "Vous êtes bien authentifié (utilisateur)", member: safe });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

exports.getAllMembers = async (req, res) => {
  try {
    const { name, role } = req.query;
    
    const members = await Member.findAll({
      attributes: { exclude: ['password'] },
      where: {
        ...(name && { name }),
        ...(role && { role }),
      },
    });
    return res.status(200).json(members);
  } catch (err) {
    console.error("Erreur de recuperation des members:", err);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

// Modifie un membre
exports.updateMember = async (req, res) => {
  try {
    const memberId = req.params.id;
    const { name, email, password, role, projectId } = req.body;
    const member = await Member.findByPk(memberId);

    if (!member) {
      return res.status(404).json({ message: `Membre ${memberId} introuvable` });
    }
    await member.update({ name, email, password, role, projectId });
    const { password: _, ...safe } = member.toJSON();
    return res.status(200).json(safe);
  } catch (err) {
    console.error("Erreur de mise à jour du membre:", err);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

// Supprime un membre
exports.deleteMember = async (req, res) => {
  try {
    const memberId = req.params.id;
    const member = await Member.findByPk(memberId);
    if (!member) {
      return res.status(404).json({ message: `Membre ${memberId} introuvable` });
    }
    await member.destroy();
    return res.status(200).json({ message: `Membre ${memberId} supprimé` });
  } catch (err) {
    console.error("Erreur de suppression du membre:", err);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};