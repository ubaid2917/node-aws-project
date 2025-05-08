require('dotenv').config(); // load env variables first
const express = require('express');
const { sequelize } = require('./models');

const app = express();

// Connect DB and start server
sequelize.authenticate()
  .then(() => {
    console.log('✅ DB connected successfully');

    app.listen(3000, () => {
      console.log('🚀 Server running at http://localhost:3000');
    });
  })
  .catch((error) => {
    console.error('❌ Unable to connect to DB:', error);
  }); 



