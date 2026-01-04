// Modèle Sequelize (remplace la version "in-memory" précédente)
const sequelize = require("../config/sequelize.config");
const { Model, DataTypes } = require("sequelize");
const { Member } = require("./member.model");

class Project extends Model {}

Project.init({
  name: {
    type: DataTypes.STRING(120),
    allowNull: false,
    unique: true,
    validate: { notEmpty: true, len: [3, 120] },
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: "",
  },
  organizer: {
    type: DataTypes.STRING(80),
    allowNull: false,
    validate: { notEmpty: true, len: [3, 80] },
  },

  specFile: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      isPdfExt(value) {
        if (!/\.pdf$/i.test(value)) {
          throw new Error("specFile must end with .pdf");
        }
      },
    },
  },
}, {
  sequelize,
  modelName: "Project",
  tableName: "projects",
  timestamps: true,
  indexes: [{ unique: true, fields: ["name"] }],
});

Project.hasMany(Member, {
  foreignKey: { name: "projectId", allowNull: false },
  as: "members",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
Member.belongsTo(Project, {
  foreignKey: { name: "projectId", allowNull: false },
  as: "project",
});

module.exports = { Project };