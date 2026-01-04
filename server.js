const express = require('express');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Monte les routes depuis src/
app.use('/api/projects', require('./src/routes/project.routes'));
app.use('/api/auth', require('./src/routes/auth.routes'));
app.use('/api/members', require('./src/routes/members.routes'));
app.use('/api/admin', require('./src/routes/admin.routes'));


// Init Sequelize 
const sequelize = require('./src/config/sequelize.config');
require('./src/models/member.model');
require('./src/models/project.model');


(async () => {
  try {
    await sequelize.authenticate();
    console.log('Connexion PostgreSQL OK');
    await sequelize.sync({ alter: false }); 
    console.log('Synchronisation des tables terminée');
  } catch (err) {
    console.error('Échec init DB:', err);
    process.exit(1);
  }
})();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Le serveur est en route sur http://localhost:${PORT}`);
});