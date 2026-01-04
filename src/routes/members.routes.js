const express = require("express");
const router = express.Router();
const memberController = require("../controllers/member.controller");
const { verifyToken, requireRole } = require("../middlewares/auth.middleware");

// Lister 
router.get("/", memberController.getAllMembers);

// Modifier un membre (ADMIN uniquement)
router.put("/:id", verifyToken, requireRole('admin'), memberController.updateMember);

// Supprimer un membre (ADMIN uniquement)
router.delete("/:id", verifyToken, requireRole('admin'), memberController.deleteMember);

module.exports = router;