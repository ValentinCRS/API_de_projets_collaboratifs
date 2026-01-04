const sequelize = require("../config/sequelize.config");
const { Model, DataTypes } = require("sequelize");
const bcrypt = require('bcrypt');

class Member extends Model {
  async passwordMatches(plain) {
    if (!this.password) return false;

    const isBcrypt = /^\$2[aby]\$/.test(this.password);

    if (!isBcrypt) {
      const ok = plain === this.password;
      if (ok) {
        this.password = await bcrypt.hash(plain, 10);
        try { await this.save(); } catch (_) {  }
      }
      return ok;
    }

    return bcrypt.compare(plain, this.password);
  }
}

Member.init({
  name: {
    type: DataTypes.STRING(120),
    allowNull: false,
    validate: { notEmpty: true, len: [2, 120] },
  },
  role: {
    type: DataTypes.STRING(40),
    allowNull: false,
    defaultValue: 'user',
    validate: { notEmpty: true },
  },
  email: {
    type: DataTypes.STRING(150),
    allowNull: true,
    unique: true,
    validate: { isEmail: true },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  sequelize,
  modelName: "Member",
  tableName: "members",
  timestamps: true,
  hooks: {
    beforeCreate: async (member) => {
      if (member.password) {
        member.password = await bcrypt.hash(member.password, 10);
      }
    },
    beforeUpdate: async (member) => {
      if (member.changed('password') && member.password) {
        member.password = await bcrypt.hash(member.password, 10);
      }
    },
  },
});

module.exports = { Member };