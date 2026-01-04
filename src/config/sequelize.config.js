const { Sequelize } = require('sequelize');

const {
  DB_DIALECT = 'postgres',
  DB_HOST = 'localhost',
  DB_PORT = 5432,
  DB_NAME = 'API_de_projets_collaboratifs_KVN',
  DB_USER = 'postgres',
  DB_PASS = 'root',
  DB_LOGGING = 'false',
} = process.env;

const logging = DB_LOGGING === 'true' ? console.log : false;

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
  host: DB_HOST,
  port: Number(DB_PORT),
  dialect: DB_DIALECT,
  logging,
});

module.exports = sequelize;