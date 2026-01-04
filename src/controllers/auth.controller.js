const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

exports.login = async (req, res) => {
  try {
    let { email, password } = req.body;
    email = String(email || '').trim().toLowerCase();

    const member = await Member.findOne({ where: { email } });

    if (!member || member.password !== password) {
      return res.status(401).json({ message: "Identifiant ou mot de passe invalide" });
    }

    const payload = { id: member.id, email: member.email, role: member.role, name: member.name };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

    const { password: _, ...safe } = member.toJSON();
    return res.status(200).json({ message: "Vous êtes bien authentifié", token, member: safe });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

exports.register = (req, res) => {
    const { username, password } = req.body;
    res.status(201).json({ message: 'Utilisateur enregistré avec succès.' });
};