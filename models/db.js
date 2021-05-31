const Sequelize = require('sequelize');
const url = process.env.DATABASE_URL || 'postgres://postgres:0917196909vVINH@@localhost:5432/Web2'
const db = new Sequelize(url);

module.exports = db;
